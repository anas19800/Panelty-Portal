'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, PlusCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Branch } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import { useTranslation } from 'react-i18next';


const branchSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  city: z.string().min(1, 'City is required.'),
  region: z.string({ required_error: 'Region is required.' }),
  brand: z.string({ required_error: 'Brand is required.' }),
  manager: z.string().min(1, 'Manager name is required.'),
  regionalManager: z.string().min(1, 'Regional manager name is required.'),
  location: z.string().url('Please enter a valid URL.').or(z.literal('')),
});

type BranchFormValues = z.infer<typeof branchSchema>;
type Region = { id: string; name: string };
type Brand = { id: string; name: string };

export default function BranchesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  const permission = getPermission(user?.role, PERMISSIONS.BRANCHES);
  const canWrite = permission === 'write';

  useEffect(() => {
    async function fetchData() {
      try {
        const [branchesSnapshot, regionsSnapshot, brandsSnapshot] = await Promise.all([
            getDocs(collection(db, 'branches')),
            getDocs(collection(db, 'regions')),
            getDocs(collection(db, 'brands'))
        ]);
        
        setBranches(branchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Branch[]);
        setRegions(regionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Region[]);
        setBrands(brandsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Brand[]);

      } catch (error) {
        console.error('Failed to load data from Firestore', error);
        toast({ variant: 'destructive', description: t('branches.toasts.loadError') });
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [toast, t]);

  const translatedBranchSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, t('branches.toasts.nameRequired')),
      city: z.string().min(1, t('branches.toasts.cityRequired')),
      region: z.string({ required_error: t('branches.toasts.regionRequired') }),
      brand: z.string({ required_error: t('branches.toasts.brandRequired') }),
      manager: z.string().min(1, t('branches.toasts.managerRequired')),
      regionalManager: z.string().min(1, t('branches.toasts.regionalManagerRequired')),
      location: z.string().url(t('branches.toasts.locationInvalid')).or(z.literal('')),
    });
  }, [t]);
  
  const form = useForm<BranchFormValues>({
    resolver: zodResolver(translatedBranchSchema),
    defaultValues: {
      name: '', city: '', region: '', brand: '', manager: '', regionalManager: '', location: '',
    },
  });

  const filteredBranches = useMemo(() => {
    if (!user) return [];
    if (permission === 'read_own') {
      if (user.role === ROLES.BRANCH_MANAGER && user.branchId) {
        return branches.filter(branch => branch.id === user.branchId);
      }
      if (user.role === ROLES.REGIONAL_MANAGER && user.region) {
        return branches.filter(branch => branch.region === user.region);
      }
    }
    return branches;
  }, [branches, user, permission]);

  useEffect(() => {
    if (dialogOpen) {
        if (editingBranch) {
            form.reset(editingBranch);
        } else {
            form.reset({ name: '', city: '', region: '', brand: '', manager: '', regionalManager: '', location: '' });
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

  const handleDeleteConfirm = async () => {
    if (branchToDelete) {
      try {
        await deleteDoc(doc(db, "branches", branchToDelete.id));
        setBranches(branches.filter((b) => b.id !== branchToDelete.id));
        toast({ description: t('branches.toasts.deleteSuccess') });
      } catch (error) {
        console.error("Error deleting branch: ", error);
        toast({ variant: 'destructive', description: t('branches.toasts.deleteError') });
      } finally {
        setDeleteDialogOpen(false);
        setBranchToDelete(null);
      }
    }
  };

  const onSubmit = async (values: BranchFormValues) => {
    try {
      if (editingBranch) {
        const branchRef = doc(db, "branches", editingBranch.id);
        await updateDoc(branchRef, values);
        setBranches(branches.map((b) => b.id === editingBranch.id ? { ...b, ...values } : b));
        toast({ description: t('branches.toasts.updateSuccess') });
      } else {
        const docRef = await addDoc(collection(db, "branches"), values);
        const newBranch: Branch = { id: docRef.id, ...values };
        setBranches([...branches, newBranch]);
        toast({ description: t('branches.toasts.addSuccess') });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving branch: ", error);
      toast({ variant: 'destructive', description: t('branches.toasts.saveError') });
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        const newBranchesData = jsonData.map((row) => {
          const name = row['اسم الفرع']?.toString().trim();
          if (!name) return null;
          return {
            name: name,
            city: row['المدينة']?.toString().trim() || '',
            region: row['المنطقة']?.toString().trim() || '',
            brand: row['البراند']?.toString().trim() || '',
            manager: row['مدير الفرع']?.toString().trim() || '',
            regionalManager: row['المدير الإقليمي']?.toString().trim() || '',
            location: row['رابط الموقع']?.toString().trim() || '',
          };
        }).filter((branch): branch is BranchFormValues => branch !== null);
        
        if (newBranchesData.length > 0) {
          const batch = writeBatch(db);
          newBranchesData.forEach(branchData => {
            const docRef = doc(collection(db, "branches"));
            batch.set(docRef, branchData);
          });
          await batch.commit();

          // Refetch branches
          const branchesSnapshot = await getDocs(collection(db, 'branches'));
          setBranches(branchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Branch[]);

          toast({ description: t('branches.toasts.importSuccess', {count: newBranchesData.length}) });
        } else {
          toast({ variant: 'destructive', description: t('branches.toasts.importNoData') });
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast({ variant: 'destructive', description: t('branches.toasts.importProcessError') });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = (error) => {
        console.error("FileReader error:", error);
        toast({ variant: 'destructive', description: t('branches.toasts.importReadError') });
    }
    reader.readAsArrayBuffer(file);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t('branches.title')} />
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
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileImport} />
      <div className="flex flex-col gap-6">
        <PageHeader title={t('branches.title')}>
          {canWrite && (
            <>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('branches.import')}
              </Button>
              <Button onClick={handleAddNew}>
                <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" /> {t('branches.addNew')}
              </Button>
            </>
          )}
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>{t('branches.listTitle')}</CardTitle>
            <CardDescription>
              {t('branches.listDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('branches.table.name')}</TableHead>
                  <TableHead>{t('branches.table.city')}</TableHead>
                  <TableHead>{t('branches.table.region')}</TableHead>
                  <TableHead>{t('branches.table.brand')}</TableHead>
                  <TableHead>{t('branches.table.manager')}</TableHead>
                  {canWrite && <TableHead><span className="sr-only">{t('nav.actions')}</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>{branch.region}</TableCell>
                    <TableCell>{branch.brand}</TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    {canWrite && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('nav.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(branch)}>{t('common.edit')}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(branch)}>{t('common.delete')}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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
            <DialogTitle>{editingBranch ? t('branches.dialog.editTitle') : t('branches.dialog.addTitle')}</DialogTitle>
            <DialogDescription>{editingBranch ? t('branches.dialog.editDescription') : t('branches.dialog.addDescription')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.name')}</FormLabel><FormControl><Input placeholder={t('branches.dialog.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.city')}</FormLabel><FormControl><Input placeholder={t('branches.dialog.cityPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.region')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('branches.dialog.selectRegion')} /></SelectTrigger></FormControl><SelectContent>{regions.map((r) => (<SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.brand')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('branches.dialog.selectBrand')} /></SelectTrigger></FormControl><SelectContent>{brands.map((b) => (<SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="manager" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.manager')}</FormLabel><FormControl><Input placeholder={t('branches.dialog.managerPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="regionalManager" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.regionalManager')}</FormLabel><FormControl><Input placeholder={t('branches.dialog.regionalManagerPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>{t('branches.dialog.location')}</FormLabel><FormControl><Input placeholder={t('branches.dialog.locationPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit">{t('common.save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>{t('branches.deleteDialog.description', { branchName: branchToDelete?.name })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
