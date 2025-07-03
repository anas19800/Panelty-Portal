"use client";

import { useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { regions, brands, branches, Branch } from '@/lib/mock-data';

export default function NewViolationPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [branchDetails, setBranchDetails] = useState<Branch | null>(null);
  const [date, setDate] = useState<Date>();

  const availableBrands = Array.from(new Set(branches.filter(b => b.region === selectedRegion).map(b => b.brand)));
  const availableBranches = branches.filter(b => b.region === selectedRegion && b.brand === selectedBrand);

  useEffect(() => {
    if (selectedBranch) {
      const details = branches.find(b => b.id === selectedBranch);
      setBranchDetails(details || null);
    } else {
      setBranchDetails(null);
    }
  }, [selectedBranch]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="تسجيل مخالفة جديدة" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. اختيار الفرع</CardTitle>
                    <CardDescription>الرجاء اختيار المنطقة ثم البراند والفرع لتسجيل المخالفة.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="region">المنطقة التشغيلية</Label>
                            <Select onValueChange={setSelectedRegion}>
                                <SelectTrigger id="region"><SelectValue placeholder="اختر منطقة" /></SelectTrigger>
                                <SelectContent>
                                    {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="brand">البراند</Label>
                            <Select onValueChange={setSelectedBrand} disabled={!selectedRegion}>
                                <SelectTrigger id="brand"><SelectValue placeholder="اختر براند" /></SelectTrigger>
                                <SelectContent>
                                    {availableBrands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="branch">الفرع</Label>
                            <Select onValueChange={setSelectedBranch} disabled={!selectedBrand}>
                                <SelectTrigger id="branch"><SelectValue placeholder="اختر فرع" /></SelectTrigger>
                                <SelectContent>
                                    {availableBranches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>2. تفاصيل المخالفة</CardTitle>
                    <CardDescription>أدخل معلومات المخالفة وتفاصيلها الدقيقة.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="violation-number">رقم المخالفة</Label>
                        <Input id="violation-number" placeholder="e.g., 123456789" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="payment-number">رقم السداد</Label>
                        <Input id="payment-number" placeholder="e.g., SADAD-98765" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="violation-date">تاريخ الرصد</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-right font-normal", !date && "text-muted-foreground")}>
                                    <CalendarIcon className="ml-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>اختر تاريخ</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={setDate} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fine-amount">قيمة المخالفة</Label>
                        <Input id="fine-amount" type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">الفئة العامة</Label>
                        <Select><SelectTrigger id="category"><SelectValue placeholder="اختر فئة" /></SelectTrigger><SelectContent><SelectItem value="hygiene">نظافة</SelectItem><SelectItem value="health">صحة</SelectItem><SelectItem value="license">تراخيص</SelectItem></SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sub-category">الفئة الفرعية</Label>
                        <Input id="sub-category" placeholder="e.g., نظافة عامة" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                         <Label>الصور المرفقة</Label>
                         <div className="flex items-center justify-center w-full">
                            <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <Input id="dropzone-file" type="file" className="hidden" multiple/>
                            </Label>
                        </div> 
                    </div>
                     <div className="md:col-span-2 space-y-2">
                        <Label>حالة المخالفة</Label>
                         <RadioGroup defaultValue="unpaid" className="flex gap-4">
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="paid" id="paid" />
                                <Label htmlFor="paid">مدفوعة</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="unpaid" id="unpaid" />
                                <Label htmlFor="unpaid">غير مدفوعة</Label>
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <RadioGroupItem value="filed" id="filed" />
                                <Label htmlFor="filed">ملفية</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                <Button variant="outline">إلغاء</Button>
                <Button>حفظ المخالفة</Button>
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
                            <Button variant="outline" className="w-full" onClick={() => window.open(branchDetails.location, '_blank')}>عرض الموقع</Button>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">الرجاء اختيار فرع لعرض معلوماته.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
