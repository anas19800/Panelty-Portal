'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, PlusCircle } from 'lucide-react';

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  branches as initialBranches,
  regions as initialRegions,
  brands as initialBrands,
  Branch,
} from '@/lib/mock-data';

const branchSchema = z.object({
  name: z.string().min(1, 'اسم الفرع مطلوب.'),
  city: z.string().min(1, 'المدينة مطلوبة.'),
  region: z.string({ required_error: 'الرجاء اختيار منطقة.' }),
  brand: z.string({ required_error: 'الرجاء اختيار براند.' }),
  manager: z.string().min(1, 'اسم مدير الفرع مطلوب.'),
  regionalManager: z.string().min(1, 'اسم المدير الإقليمي مطلوب.'),
  location: z.string().url('الرجاء إدخال رابط صحيح للموقع.').or(z.literal('')),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function BranchesPage() {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  useEffect(() => {
    try {
      const storedBranches = localStorage.getItem('branches');
      const storedRegions = localStorage.getItem('regions');
      const storedBrands = localStorage.getItem('brands');

      setBranches(storedBranches ? JSON.parse(storedBranches) : initialBranches);
      setRegions(storedRegions ? JSON.parse(storedRegions) : initialRegions);
      setBrands(storedBrands ? JSON.parse(storedBrands) : initialBrands);
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      toast({ variant: 'destructive', description: 'فشل في تحميل البيانات من المتصفح.' });
      setBranches(initialBranches);
      setRegions(initialRegions);
      setBrands(initialBrands);
    } finally {
      setIsLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('branches', JSON.stringify(branches));
      } catch (error) {
        console.error('Failed to save branches to localStorage', error);
        toast({ variant: 'destructive', description: 'فشل في حفظ بيانات الفروع في المتصفح.' });
      }
    }
  }, [branches, isLoaded, toast]);
  
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: '',
      city: '',
      region: '',
      brand: '',
      manager: '',
      regionalManager: '',
      location: '',
    },
  });

  useEffect(() => {
    if (dialogOpen) {
        if (editingBranch) {
            form.reset(editingBranch);
        } else {
            form.reset({
                name: '',
                city: '',
                region: '',
                brand: '',
                manager: '',
                regionalManager: '',
                location: '',
            });
        }
    }
  }, [editingBranch, dialogOpen, form]);

  const handleAddNew = () => {
    setEditingBranch(null);
    setDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setDialogOpen(true);
  };
  
  const handleDeleteClick = (branch: Branch) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (branchToDelete) {
      setBranches(branches.filter((b) => b.id !== branchToDelete.id));
      toast({ description: 'تم حذف الفرع بنجاح.' });
      setDeleteDialogOpen(false);
      setBranchToDelete(null);
    }
  };

  const onSubmit = (values: BranchFormValues) => {
    if (editingBranch) {
      // Update existing branch
      setBranches(
        branches.map((b) =>
          b.id === editingBranch.id ? { ...b, ...values } : b
        )
      );
      toast({ description: 'تم تعديل الفرع بنجاح.' });
    } else {
      // Add new branch
      const newBranch: Branch = {
        id: `b${new Date().getTime()}`,
        ...values,
      };
      setBranches([...branches, newBranch]);
      toast({ description: 'تمت إضافة الفرع بنجاح.' });
    }
    setDialogOpen(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إدارة الفروع" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader title="إدارة الفروع">
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            إضافة فرع جديد
          </Button>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>قائمة الفروع</CardTitle>
            <CardDescription>
              عرض وتعديل بيانات الفروع المسجلة في النظام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الفرع</TableHead>
                  <TableHead>المدينة</TableHead>
                  <TableHead>المنطقة</TableHead>
                  <TableHead>البراند</TableHead>
                  <TableHead>مدير الفرع</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>{branch.region}</TableCell>
                    <TableCell>{branch.brand}</TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(branch)}>
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(branch)}
                          >
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? 'قم بتحديث معلومات الفرع هنا.'
                : 'أدخل معلومات الفرع الجديد هنا.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الفرع</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: فرع العليا" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدينة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: الرياض" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المنطقة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر منطقة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
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
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر براند" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مدير الفرع</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم مدير الفرع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="regionalManager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدير الإقليمي</FormLabel>
                      <FormControl>
                        <Input placeholder="اسم المدير الإقليمي" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الموقع (اختياري)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://maps.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات الفرع "{branchToDelete?.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
