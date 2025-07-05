"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, parseISO } from 'date-fns';
import { CalendarIcon, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
import { useTranslation } from 'react-i18next';

const violationFormSchema = z.object({
  region: z.string({ required_error: "Please select a region." }),
  brand: z.string({ required_error: "Please select a brand." }),
  branchId: z.string({ required_error: "Please select a branch." }),
  violationNumber: z.string().min(1, "Please enter the violation number."),
  paymentNumber: z.string().optional(),
  violationDate: z.date({ required_error: "Please select the detection date." }),
  lastObjectionDate: z.date({ required_error: "Please select the last objection date." }),
  fineAmount: z.coerce.number().positive("Fine amount must be greater than zero."),
  category: z.string({ required_error: "Please select a main category." }),
  subCategory: z.string({ required_error: "Please select a sub-category." }),
  status: z.enum(["paid", "unpaid", "filed"], { required_error: "Please select a status." }),
});

type ViolationFormValues = z.infer<typeof violationFormSchema>;
type Region = { id: string, name: string };
type Brand = { id: string, name: string };

function EditViolationPageContent({ violationId }: { violationId: string }) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  
  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(violationFormSchema),
  });

  useEffect(() => {
    async function fetchData() {
        try {
            const [
                regionsSnapshot,
                brandsSnapshot,
                branchesSnapshot,
                categoriesSnapshot,
                violationSnap,
            ] = await Promise.all([
                getDocs(collection(db, 'regions')),
                getDocs(collection(db, 'brands')),
                getDocs(collection(db, 'branches')),
                getDocs(collection(db, 'violationCategories')),
                getDoc(doc(db, 'violations', violationId))
            ]);
            
            setRegions(regionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            
            setAllBrands(brandsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

            const branchesData = branchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Branch[];
            setAllBranches(branchesData);

            const categoriesData = categoriesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ViolationCategory[];
            setCategories(categoriesData);

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
                    status: violationData.status as Violation['status'],
                });
                
                const branch = branchesData.find(b => b.id === violationData.branchId);
                setBranchDetails(branch || null);
                setExistingImageUrls(violationData.imageUrls || []);

            } else {
                toast({ variant: 'destructive', description: t('violations.toasts.notFound') });
                router.push('/violations');
            }

        } catch (error) {
            console.error('Failed to load data from Firestore', error);
            toast({ variant: 'destructive', description: t('violations.toasts.dataLoadError')});
        } finally {
            setIsDataLoaded(true);
        }
    }
    fetchData();
  }, [toast, violationId, router, form, t]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const allFiles = Array.from(event.target.files);
      const validFiles = allFiles.filter(file => file.size <= maxFileSize);
      const oversizedFiles = allFiles.filter(file => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: t('violations.toasts.fileSizeErrorTitle'),
          description: t('violations.toasts.fileSizeErrorDesc', {count: oversizedFiles.length}),
        });
      }
      setNewImageFiles(validFiles);
    }
  };

  const handleRemoveExistingImage = (indexToRemove: number) => {
      setExistingImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  async function onSubmit(data: ViolationFormValues) {
    setIsSubmitting(true);
    try {
        const branch = allBranches.find(b => b.id === data.branchId);
        if (!branch) throw new Error("Branch not found");

        const category = categories.find(c => c.mainCategoryCode === data.category);
        const subCategory = category?.subCategories.find(sc => sc.code === data.subCategory);

        const newlyUploadedUrls: string[] = [];
        if (newImageFiles.length > 0) {
            const storage = getStorage();
            for (const file of newImageFiles) {
                const storageRef = ref(storage, `violations/${violationId}/${Date.now()}-${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(snapshot.ref);
                newlyUploadedUrls.push(downloadUrl);
            }
        }
        
        const uploadedImageUrls = [...existingImageUrls, ...newlyUploadedUrls];

        const updatedViolationData = {
            violationNumber: data.violationNumber,
            paymentNumber: data.paymentNumber || '',
            date: format(data.violationDate, 'yyyy-MM-dd'),
            lastObjectionDate: format(data.lastObjectionDate, 'yyyy-MM-dd'),
            category: category?.mainCategory || 'غير محدد',
            subCategory: subCategory?.name || 'غير محدد',
            amount: data.fineAmount,
            status: data.status,
            branchId: branch.id,
            branchName: branch.name,
            brand: branch.brand,
            region: branch.region,
            city: branch.city,
            imageUrls: uploadedImageUrls,
        };
        
        const violationRef = doc(db, 'violations', violationId);
        await updateDoc(violationRef, updatedViolationData);
        
        toast({ title: t('common.success'), description: t('violations.toasts.updateSuccess') });
        router.push('/violations');

    } catch (error) {
        console.error('Failed to save violation:', error);
        toast({ variant: 'destructive', description: t('violations.toasts.updateError') });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (!isDataLoaded) {
      return (
         <div className="flex flex-col gap-6">
            <PageHeader title={t('violations.form.editTitle')} />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card><CardHeader><CardTitle>{t('common.loading')}</CardTitle></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t('violations.form.editTitle')} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('violations.form.step1Title')}</CardTitle>
                <CardDescription>{t('violations.form.step1Desc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.region')}</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder={t('violations.form.selectRegion')} /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.brand')}</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchRegion}><FormControl><SelectTrigger><SelectValue placeholder={t('violations.form.selectBrand')} /></SelectTrigger></FormControl><SelectContent>{allBrands.map(b => <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="branchId" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.branch')}</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchBrand}><FormControl><SelectTrigger><SelectValue placeholder={t('violations.form.selectBranch')} /></SelectTrigger></FormControl><SelectContent>{availableBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('violations.form.step2Title')}</CardTitle>
                <CardDescription>{t('violations.form.step2Desc')}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="violationNumber" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.violationNumber')}</FormLabel><FormControl><Input placeholder={t('violations.form.violationNumberPlaceholder')} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="paymentNumber" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.paymentNumber')}</FormLabel><FormControl><Input placeholder={t('violations.form.paymentNumberPlaceholder')} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="violationDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('violations.form.detectionDate')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left rtl:text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>{t('violations.form.selectDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="lastObjectionDate" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('violations.form.objectionDeadline')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left rtl:text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>{t('violations.form.selectDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="fineAmount" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.fineAmount')}</FormLabel><FormControl><Input type="number" placeholder={t('violations.form.fineAmountPlaceholder')} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.category')}</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue placeholder={t('violations.form.selectCategory')} /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.mainCategoryCode} value={c.mainCategoryCode}>{c.mainCategory}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="subCategory" render={({ field }) => (<FormItem><FormLabel>{t('violations.form.subCategory')}</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchCategory}><FormControl><SelectTrigger><SelectValue placeholder={t('violations.form.selectSubCategory')} /></SelectTrigger></FormControl><SelectContent>{availableSubCategories.map(sc => <SelectItem key={sc.code} value={sc.code}>{`${sc.code} - ${sc.name}`}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                
                <div className="md:col-span-2 space-y-2">
                    <FormLabel>{t('violations.form.attachments')}</FormLabel>
                    {existingImageUrls.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {existingImageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img src={url} alt={`Violation image ${index + 1}`} className="h-24 w-24 object-cover rounded-md border" />
                                    </a>
                                    <Button type="button" size="icon" variant="destructive" onClick={() => handleRemoveExistingImage(index)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-muted-foreground">{t('violations.form.noAttachments')}</p>}

                    <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('violations.form.addAttachments')}</span> {t('violations.form.dropzoneHint')}</p>
                            <p className="text-xs text-muted-foreground">{t('violations.form.dropzoneMeta')}</p>
                        </div>
                        <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} accept="*" />
                        </label>
                    </div>
                    {newImageFiles.length > 0 && (
                        <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{t('violations.form.newFiles')}</p>
                            <ul className="list-disc list-inside">
                                {newImageFiles.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <FormField control={form.control} name="status" render={({ field }) => (<FormItem className="md:col-span-2 space-y-2"><FormLabel>{t('violations.form.status')}</FormLabel><FormControl><RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4"><FormItem className="flex items-center space-x-2 rtl:space-x-reverse"><FormControl><RadioGroupItem value="paid" id="paid" /></FormControl><FormLabel htmlFor="paid" className="font-normal">{t('violationStatuses.paid')}</FormLabel></FormItem><FormItem className="flex items-center space-x-2 rtl:space-x-reverse"><FormControl><RadioGroupItem value="unpaid" id="unpaid" /></FormControl><FormLabel htmlFor="unpaid" className="font-normal">{t('violationStatuses.unpaid')}</FormLabel></FormItem><FormItem className="flex items-center space-x-2 rtl:space-x-reverse"><FormControl><RadioGroupItem value="filed" id="filed" /></FormControl><FormLabel htmlFor="filed" className="font-normal">{t('violationStatuses.filed')}</FormLabel></FormItem></RadioGroup></FormControl><FormMessage /></FormItem>)} />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.push('/violations')}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader><CardTitle>{t('violations.branchInfo.title')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {branchDetails ? (
                  <>
                    <div className="font-medium">{branchDetails.name}</div>
                    <div className="text-sm text-muted-foreground">
                      <p><strong>{t('violations.branchInfo.city')}</strong> {branchDetails.city}</p>
                      <p><strong>{t('violations.branchInfo.brand')}</strong> {branchDetails.brand}</p>
                      <p><strong>{t('violations.branchInfo.manager')}</strong> {branchDetails.manager}</p>
                      <p><strong>{t('violations.branchInfo.regionalManager')}</strong> {branchDetails.regionalManager}</p>
                    </div>
                    {branchDetails.location && <Button variant="outline" className="w-full" type="button" onClick={() => window.open(branchDetails.location, '_blank')}>{t('violations.branchInfo.viewLocation')}</Button>}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('violations.branchInfo.selectBranch')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function EditViolationPage({ params }: { params: { id: string } }) {
    return (
        <PageGuard feature={PERMISSIONS.VIOLATIONS} requiredPermission="write">
            <EditViolationPageContent violationId={params.id} />
        </PageGuard>
    )
}
