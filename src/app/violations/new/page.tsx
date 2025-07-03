
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Upload } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { regions, branches, Branch } from '@/lib/mock-data';

// Zod schema for form validation
const violationFormSchema = z.object({
  region: z.string({ required_error: "الرجاء اختيار منطقة." }),
  brand: z.string({ required_error: "الرجاء اختيار براند." }),
  branchId: z.string({ required_error: "الرجاء اختيار فرع." }),
  violationNumber: z.string().min(1, "الرجاء إدخال رقم المخالفة."),
  paymentNumber: z.string().optional(),
  violationDate: z.date({ required_error: "الرجاء تحديد تاريخ الرصد." }),
  fineAmount: z.coerce.number().positive("يجب أن تكون قيمة المخالفة أكبر من صفر."),
  category: z.string({ required_error: "الرجاء اختيار فئة." }),
  subCategory: z.string().min(1, "الرجاء إدخال الفئة الفرعية."),
  status: z.enum(["paid", "unpaid", "filed"], { required_error: "الرجاء تحديد حالة المخالفة." }),
});

type ViolationFormValues = z.infer<typeof violationFormSchema>;

export default function NewViolationPage() {
  const { toast } = useToast();
  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);

  const form = useForm<ViolationFormValues>({
    resolver: zodResolver(violationFormSchema),
    defaultValues: {
      status: 'unpaid',
      paymentNumber: '',
      subCategory: ''
    },
  });

  const watchRegion = form.watch('region');
  const watchBrand = form.watch('brand');
  const watchBranchId = form.watch('branchId');

  const availableBrands = Array.from(new Set(branches.filter(b => b.region === watchRegion).map(b => b.brand)));
  const availableBranches = branches.filter(b => b.region === watchRegion && b.brand === watchBrand);

  useEffect(() => {
    if (watchBranchId) {
      const details = branches.find(b => b.id === watchBranchId);
      setBranchDetails(details || null);
    } else {
      setBranchDetails(null);
    }
  }, [watchBranchId]);

  // Reset brand and branch when region changes
  useEffect(() => {
    if (form.getValues('brand')) {
      form.resetField('brand');
    }
    if (form.getValues('branchId')) {
      form.resetField('branchId');
    }
  }, [watchRegion, form]);

  // Reset branch when brand changes
  useEffect(() => {
    if (form.getValues('branchId')) {
      form.resetField('branchId');
    }
  }, [watchBrand, form]);

  function onSubmit(data: ViolationFormValues) {
    console.log(data);
    toast({
      title: "نجاح",
      description: "تم حفظ المخالفة بنجاح.",
    });
    form.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="تسجيل مخالفة جديدة" />
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
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنطقة التشغيلية</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="اختر منطقة" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البراند</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchRegion}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="اختر براند" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفرع</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={!watchBrand}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="اختر فرع" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>2. تفاصيل المخالفة</CardTitle>
                <CardDescription>أدخل معلومات المخالفة وتفاصيلها الدقيقة.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="violationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم المخالفة</FormLabel>
                      <FormControl><Input placeholder="e.g., 123456789" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رقم السداد (اختياري)</FormLabel>
                      <FormControl><Input placeholder="e.g., SADAD-98765" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="violationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>تاريخ الرصد</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant={"outline"} className={cn("w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}>
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fineAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>قيمة المخالفة</FormLabel>
                      <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة العامة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                           <SelectTrigger><SelectValue placeholder="اختر فئة" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="hygiene">نظافة</SelectItem>
                           <SelectItem value="health">صحة</SelectItem>
                           <SelectItem value="license">تراخيص</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الفئة الفرعية</FormLabel>
                      <FormControl><Input placeholder="e.g., نظافة عامة" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 space-y-2">
                      <FormLabel>حالة المخالفة</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                           <FormItem className="flex items-center space-x-2 space-x-reverse">
                             <FormControl><RadioGroupItem value="paid" id="paid" /></FormControl>
                             <FormLabel htmlFor="paid" className="font-normal">مدفوعة</FormLabel>
                           </FormItem>
                           <FormItem className="flex items-center space-x-2 space-x-reverse">
                             <FormControl><RadioGroupItem value="unpaid" id="unpaid" /></FormControl>
                             <FormLabel htmlFor="unpaid" className="font-normal">غير مدفوعة</FormLabel>
                           </FormItem>
                           <FormItem className="flex items-center space-x-2 space-x-reverse">
                             <FormControl><RadioGroupItem value="filed" id="filed" /></FormControl>
                             <FormLabel htmlFor="filed" className="font-normal">ملفية</FormLabel>
                           </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => form.reset()}>إلغاء</Button>
                <Button type="submit">حفظ المخالفة</Button>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>معلومات الفرع</CardTitle>
              </CardHeader>
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
                    <Button variant="outline" className="w-full" type="button" onClick={() => window.open(branchDetails.location, '_blank')}>عرض الموقع</Button>
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

    