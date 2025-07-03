"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Branch, Violation, ViolationCategory } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { PageGuard } from '@/context/auth-context';
import { PERMISSIONS } from '@/lib/permissions';

const violationFormSchema = z.object({
  region: z.string({ required_error: "الرجاء اختيار منطقة." }),
  brand: z.string({ required_error: "الرجاء اختيار براند." }),
  branchId: z.string({ required_error: "الرجاء اختيار فرع." }),
  violationNumber: z.string().min(1, "الرجاء إدخال رقم المخالفة."),
  paymentNumber: z.string().optional(),
  violationDate: z.date({ required_error: "الرجاء تحديد تاريخ الرصد." }),
  lastObjectionDate: z.date({ required_error: "الرجاء تحديد آخر موعد للاعتراض." }),
  fineAmount: z.coerce.number().positive("يجب أن تكون قيمة المخالفة أكبر من صفر."),
  category: z.string({ required_error: "الرجاء اختيار الفئة الرئيسية." }),
  subCategory: z.string({ required_error: "الرجاء اختيار الفئة الفرعية." }),
  status: z.enum(["paid", "unpaid", "filed"], { required_error: "الرجاء تحديد حالة المخالفة." }),
});

type ViolationFormValues = z.infer<typeof violationFormSchema>;
type Region = { id: string, name: string };
type Brand = { id: string, name: string };

function EditViolationPageContent({ violationId }: { violationId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(violationFormSchema),
  });

  useEffect(() => {
    async function fetchData() {
        try {
            const regionsSnapshot = await getDocs(collection(db, 'regions'));
            setRegions(regionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            
            const brandsSnapshot = await getDocs(collection(db, 'brands'));
            setAllBrands(brandsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

            const branchesSnapshot = await getDocs(collection(db, 'branches'));
            const branchesData = branchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Branch[];
            setAllBranches(branchesData);

            const categoriesSnapshot = await getDocs(collection(db, 'violationCategories'));
            const categoriesData = categoriesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ViolationCategory[];
            setCategories(categoriesData);

            const violationRef = doc(db, 'violations', violationId);
            const violationSnap = await getDoc(violationRef);

            if (violationSnap.exists()) {
                const violationData = violationSnap.data() as Violation;
                
                const category = categoriesData.find(c => c.mainCategory === violationData.category);
                const subCategory = category?.subCategories.find(sc => sc.name === violationData.subCategory);

                form.reset({
                    region: violationData.region,
                    brand: violationData.brand,
                    branchId: violationData.branchId,
                    violationNumber: violationData.violationNumber,
                    paymentNumber: violationData.paymentNumber,
                    violationDate: parseISO(violationData.date),
                    lastObjectionDate: violationData.lastObjectionDate ? parseISO(violationData.lastObjectionDate) : addDays(parseISO(violationData.date), 15),
                    fineAmount: violationData.amount,
                    category: category?.mainCategoryCode || '',
                    subCategory: subCategory?.code || '',
                    status: violationData.status === 'مدفوعة' ? 'paid' : violationData.status === 'غير مدفوعة' ? 'unpaid' : 'filed',
                });
                
                const branch = branchesData.find(b => b.id === violationData.branchId);
                setBranchDetails(branch || null);

            } else {
                toast({ variant: 'destructive', description: 'لم يتم العثور على المخالفة.' });
                router.push('/violations');
            }

        } catch (error) {
            console.error('Failed to load data from Firestore', error);
            toast({ variant: 'destructive', description: 'فشل تحميل البيانات.'});
        } finally {
            setIsDataLoaded(true);
        }
    }
    fetchData();
  }, [toast, violationId, router, form]);

  const watchRegion = form.watch('region');
  const watchBrand = form.watch('brand');
  const watchBranchId = form.watch('branchId');
  const watchCategory = form.watch('category');

  const availableBranches = allBranches.filter(b => b.region === watchRegion && b.brand === watchBrand);
  const availableSubCategories = categories.find(c => c.mainCategoryCode === watchCategory)?.subCategories || [];

  useEffect(() => {
    if (watchBranchId) {
      setBranchDetails(allBranches.find(b => b.id === watchBranchId) || null);
    } else {
      setBranchDetails(null);
    }
  }, [watchBranchId, allBranches]);
  
  useEffect(() => { form.resetField('brand', { defaultValue: form.getValues('brand') }); form.resetField('branchId', { defaultValue: form.getValues('branchId') }); }, [watchRegion, form]);
  useEffect(() => { form.resetField('branchId', { defaultValue: form.getValues('branchId') }); }, [watchBrand, form]);
  useEffect(() => { form.resetField('subCategory', { defaultValue: '' }); }, [watchCategory, form]);

  async function onSubmit(data: ViolationFormValues) {
    try {
        const branch = allBranches.find(b => b.id === data.branchId);
        if (!branch) throw new Error("Branch not found");

        const category = categories.find(c => c.mainCategoryCode === data.category);
        const subCategory = category?.subCategories.find(sc => sc.code === data.subCategory);

        const updatedViolationData = {
            violationNumber: data.violationNumber,
            paymentNumber: data.paymentNumber || '',
            date: format(data.violationDate, 'yyyy-MM-dd'),
            lastObjectionDate: format(data.lastObjectionDate, 'yyyy-MM-dd'),
            category: category?.mainCategory || 'غير محدد',
            subCategory: subCategory?.name || 'غير محدد',
            amount: data.fineAmount,
            status: data.status === 'paid' ? 'مدفوعة' : data.status === 'unpaid' ? 'غير مدفوعة' : 'ملفية',
            branchId: branch.id,
            branchName: branch.name,
            brand: branch.brand,
            region: branch.region,
            city: branch.city,
        };
        
        const violationRef = doc(db, 'violations', violationId);
        await updateDoc(violationRef, updatedViolationData);
        
        toast({ title: "نجاح", description: "تم تحديث المخالفة بنجاح." });
        router.push('/violations');

    } catch (error) {
        console.error('Failed to save violation:', error);
        toast({ variant: 'destructive', description: 'حدث خطأ أثناء تحديث المخالفة.' });
    }
  }

  if (!isDataLoaded) {
      return (
         <div className="flex flex-col gap-6">
            <PageHeader title="تعديل مخالفة" />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card><CardHeader><CardTitle>جاري تحميل البيانات...</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="تعديل مخالفة" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>1. اختيار الفرع</CardTitle>
                <CardDescription>الرجاء اختيار المنطقة ثم البراند والفرع لتسجيل المخالفة.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>المنطقة التشغيلية</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="اختر منطقة" /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>البراند</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchRegion}><FormControl><SelectTrigger><SelectValue placeholder="اختر براند" /></SelectTrigger></FormControl><SelectContent>{allBrands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="branchId" render={({ field }) => (<FormItem><FormLabel>الفرع</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchBrand}><FormControl><SelectTrigger><SelectValue placeholder="اختر فرع" /></SelectTrigger></FormControl><SelectContent>{availableBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. تفاصيل المخالفة</CardTitle>
                <CardDescription>أدخل معلومات المخالفة وتفاصيلها الدقيقة.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="violationNumber" render={({ field }) => (<FormItem><FormLabel>رقم المخالفة</FormLabel><FormControl><Input placeholder="e.g., 123456789" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="paymentNumber" render={({ field }) => (<FormItem><FormLabel>رقم السداد (اختياري)</FormLabel><FormControl><Input placeholder="e.g., SADAD-98765" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="violationDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>تاريخ الرصد</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="ml-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastObjectionDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>آخر موعد للاعتراض</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="ml-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fineAmount" render={({ field }) => (<FormItem><FormLabel>قيمة المخالفة</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>الفئة العامة</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder="اختر فئة" /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.mainCategoryCode} value={c.mainCategoryCode}>{c.mainCategory}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem><FormLabel>الفئة الفرعية</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchCategory}><FormControl><SelectTrigger><SelectValue placeholder="اختر فئة فرعية" /></SelectTrigger></FormControl><SelectContent>{availableSubCategories.map(sc => <SelectItem key={sc.code} value={sc.code}>{`${sc.code} - ${sc.name}`}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <div className="md:col-span-2 space-y-2">
                  <FormLabel>الصور المرفقة</FormLabel>
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG</p>
                      </div>
                      <Input id="dropzone-file" type="file" className="hidden" multiple />
                    </label>
                  </div>
                </div>
                <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="md:col-span-2 space-y-2"><FormLabel>حالة المخالفة</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="paid" id="paid" /></FormControl><FormLabel htmlFor="paid" className="font-normal">مدفوعة</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="unpaid" id="unpaid" /></FormControl><FormLabel htmlFor="unpaid" className="font-normal">غير مدفوعة</FormLabel></FormItem><FormItem className="flex items-center space-x-2 space-x-reverse"><FormControl><RadioGroupItem value="filed" id="filed" /></FormControl><FormLabel htmlFor="filed" className="font-normal">ملفية</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.push('/violations')}>إلغاء</Button>
                <Button type="submit">حفظ التعديلات</Button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader><CardTitle>معلومات الفرع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {branchDetails ? (
                  <>
                    <div className="font-medium">{branchDetails.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>المدينة:</strong> {branchDetails.city}</p>
                      <p><strong>البراند:</strong> {branchDetails.brand}</p>
                      <p><strong>مدير الفرع:</strong> {branchDetails.manager}</p>
                      <p><strong>المدير الإقليمي:</strong> {branchDetails.regionalManager}</p>
                    </div>
                    {branchDetails.location && <Button variant="outline" className="w-full" type="button" onClick={() => window.open(branchDetails.location, '_blank')}>عرض الموقع</Button>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">الرجاء اختيار فرع لعرض معلوماته.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function EditViolationPage({ params: { id } }: { params: { id: string } }) {
    return (
        <PageGuard feature={PERMISSIONS.VIOLATIONS} requiredPermission="write">
            <EditViolationPageContent violationId={id} />
        </PageGuard>
    )
}
