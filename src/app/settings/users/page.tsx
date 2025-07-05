'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Branch } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { PageGuard } from '@/context/auth-context';
import { PERMISSIONS, ROLES } from '@/lib/permissions';
import { useTranslation } from 'react-i18next';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email.'),
  role: z.nativeEnum(ROLES, { required_error: 'Role is required.' }),
  branchId: z.string().optional(),
  region: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const roles = Object.values(ROLES);
type DbRegion = { id: string; name: string; };

function UsersPageContent() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [regions, setRegions] = useState<DbRegion[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersSnapshot, branchesSnapshot, regionsSnapshot] = await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, 'branches')),
            getDocs(collection(db, 'regions'))
        ]);
        
        setUsers(usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as User[]);
        setBranches(branchesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Branch[]);
        setRegions(regionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

      } catch (error) {
        console.error('Failed to load data from Firestore', error);
        toast({ variant: 'destructive', description: t('users.toasts.loadError') });
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [toast, t]);

  const translatedUserSchema = useMemo(() => {
    return z.object({
      name: z.string().min(1, t('users.toasts.nameRequired')),
      email: z.string().email(t('users.toasts.invalidEmail')),
      role: z.nativeEnum(ROLES, { required_error: t('users.toasts.roleRequired') }),
      branchId: z.string().optional(),
      region: z.string().optional(),
    });
  }, [t]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(translatedUserSchema),
    defaultValues: { name: '', email: '', role: undefined, branchId: '', region: '' },
  });

  const watchRole = form.watch('role');

  useEffect(() => {
    if (dialogOpen) {
      if (editingUser) {
        form.reset({ name: editingUser.name, email: editingUser.email, role: editingUser.role as keyof typeof ROLES, branchId: editingUser.branchId, region: editingUser.region });
      } else {
        form.reset({ name: '', email: '', role: undefined, branchId: '', region: '' });
      }
    }
  }, [editingUser, dialogOpen, form]);

  const handleAddNew = () => { setEditingUser(null); setDialogOpen(true); };
  const handleEdit = (user: User) => { setEditingUser(user); setDialogOpen(true); };
  const handleDeleteClick = (user: User) => { setUserToDelete(user); setDeleteDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, "users", userToDelete.id));
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        toast({ description: t('users.toasts.deleteSuccess') });
      } catch (error) {
        toast({ variant: 'destructive', description: t('users.toasts.deleteError') });
      } finally {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      }
    }
  };
  
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { status: newStatus });
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        toast({ description: t('users.toasts.statusToggleSuccess', { userName: user.name }) });
    } catch (error) {
        toast({ variant: 'destructive', description: t('users.toasts.statusToggleError') });
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      const branch = branches.find(b => b.id === values.branchId);
      const dataToSave: Partial<User> = {
        ...values,
        branchName: watchRole === ROLES.BRANCH_MANAGER ? branch?.name : undefined,
      };


      if (editingUser) {
        const userRef = doc(db, "users", editingUser.id);
        await updateDoc(userRef, dataToSave);
        setUsers(users.map((u) => u.id === editingUser.id ? { ...u, ...dataToSave } : u));
        toast({ description: t('users.toasts.updateSuccess') });
      } else {
        const newUserDoc = { ...dataToSave, status: 'active' as const };
        const docRef = await addDoc(collection(db, "users"), newUserDoc);
        setUsers([...users, { ...newUserDoc, id: docRef.id } as User]);
        toast({ description: t('users.toasts.addSuccess') });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', description: t('users.toasts.saveError') });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title={t('users.title')} />
        <Card><CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader title={t('users.title')}>
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> {t('users.addNew')}</Button>
        </PageHeader>
        <Card>
          <CardHeader><CardTitle>{t('users.listTitle')}</CardTitle><CardDescription>{t('users.listDescription')}</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>{t('users.table.name')}</TableHead><TableHead>{t('users.table.email')}</TableHead><TableHead>{t('users.table.role')}</TableHead><TableHead>{t('users.table.status')}</TableHead><TableHead><span className="sr-only">{t('nav.actions')}</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{t(`roles.${user.role}` as const, user.role)}{user.role === ROLES.BRANCH_MANAGER && user.branchName ? ` (${user.branchName})` : ''}{user.role === ROLES.REGIONAL_MANAGER && user.region ? ` (${user.region})` : ''}</TableCell>
                    <TableCell><Badge variant={user.status === 'active' ? 'default' : 'outline'}>{t(`userStatuses.${user.status}` as const, user.status)}</Badge></TableCell>
                    <TableCell>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('nav.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>{t('common.edit')}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>{user.status === 'active' ? t('users.actions.toggleInactive') : t('users.actions.toggleActive')}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(user)}><Trash2 className="ml-2 h-4 w-4" />{t('common.delete')}</DropdownMenuItem>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingUser ? t('users.dialog.editTitle') : t('users.dialog.addTitle')}</DialogTitle><DialogDescription>{t('users.dialog.description')}</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('users.dialog.name')}</FormLabel><FormControl><Input placeholder={t('users.dialog.namePlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('users.dialog.email')}</FormLabel><FormControl><Input type="email" placeholder={t('users.dialog.emailPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>{t('users.dialog.role')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('users.dialog.selectRole')} /></SelectTrigger></FormControl><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{t(`roles.${r}` as const, r)}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              {watchRole === ROLES.BRANCH_MANAGER && (
                <FormField control={form.control} name="branchId" render={({ field }) => (<FormItem><FormLabel>{t('users.dialog.branch')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('users.dialog.selectBranch')} /></SelectTrigger></FormControl><SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}
              {watchRole === ROLES.REGIONAL_MANAGER && (
                <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>{t('users.dialog.region')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('users.dialog.selectRegion')} /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}

              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button><Button type="submit">{t('common.save')}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle><AlertDialogDescription>{t('users.deleteDialog.description', { userName: userToDelete?.name })}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function UsersPage() {
    return (
        <PageGuard feature={PERMISSIONS.USERS} requiredPermission="write">
            <UsersPageContent />
        </PageGuard>
    )
}
