'use client';

import React, { useState, useEffect } from 'react';
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
import { roleMap, userStatusMap } from '@/lib/i18n';

const userSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('البريد الإلكتروني غير صحيح.'),
  role: z.nativeEnum(ROLES, { required_error: 'الرجاء اختيار دور.' }),
  branchId: z.string().optional(),
  region: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const roles = Object.values(ROLES);
type DbRegion = { id: string; name: string; };

function UsersPageContent() {
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
        toast({ variant: 'destructive', description: 'فشل في تحميل البيانات.' });
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [toast]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
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
        toast({ description: 'تم حذف المستخدم بنجاح.' });
      } catch (error) {
        toast({ variant: 'destructive', description: 'فشل في حذف المستخدم.' });
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
        toast({ description: `تم تغيير حالة المستخدم ${user.name}.` });
    } catch (error) {
        toast({ variant: 'destructive', description: 'فشل في تغيير حالة المستخدم.' });
    }
  };

  const onSubmit = async (values: UserFormValues) => {
    // NOTE: This only adds a user to the Firestore 'users' collection.
    // It does NOT create an authentication user that can log in.
    // That requires Firebase Admin SDK on a backend.
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
        toast({ description: 'تم تعديل بيانات المستخدم بنجاح.' });
      } else {
        const newUserDoc = { ...dataToSave, status: 'active' as const };
        // This is not a real auth user, so an admin would need to create credentials separately
        const docRef = await addDoc(collection(db, "users"), newUserDoc);
        setUsers([...users, { ...newUserDoc, id: docRef.id } as User]);
        toast({ description: 'تمت إضافة المستخدم بنجاح. يجب إنشاء بيانات دخوله بشكل منفصل.' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', description: 'فشل في حفظ بيانات المستخدم.' });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="إدارة المستخدمين والصلاحيات" />
        <Card><CardHeader><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <PageHeader title="إدارة المستخدمين والصلاحيات">
          <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> إضافة مستخدم</Button>
        </PageHeader>
        <Card>
          <CardHeader><CardTitle>قائمة المستخدمين</CardTitle><CardDescription>إدارة حسابات المستخدمين والتحكم في صلاحياتهم.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>البريد الإلكتروني</TableHead><TableHead>الدور</TableHead><TableHead>الحالة</TableHead><TableHead><span className="sr-only">Actions</span></TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{roleMap[user.role]}{user.role === ROLES.BRANCH_MANAGER && user.branchName ? ` (${user.branchName})` : ''}{user.role === ROLES.REGIONAL_MANAGER && user.region ? ` (${user.region})` : ''}</TableCell>
                    <TableCell><Badge variant={user.status === 'active' ? 'default' : 'outline'}>{userStatusMap[user.status]}</Badge></TableCell>
                    <TableCell>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>تعديل</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user)}>{user.status === 'active' ? 'تعطيل المستخدم' : 'تفعيل المستخدم'}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(user)}><Trash2 className="ml-2 h-4 w-4" />حذف</DropdownMenuItem>
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
          <DialogHeader><DialogTitle>{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</DialogTitle><DialogDescription>أدخل تفاصيل المستخدم والصلاحيات الممنوحة له.</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>الاسم الكامل</FormLabel><FormControl><Input placeholder="مثال: عبدالله الصالح" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>الدور</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر دوراً للمستخدم" /></SelectTrigger></FormControl><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{roleMap[r]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              {watchRole === ROLES.BRANCH_MANAGER && (
                <FormField control={form.control} name="branchId" render={({ field }) => (<FormItem><FormLabel>الفرع</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر فرعاً" /></SelectTrigger></FormControl><SelectContent>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}
              {watchRole === ROLES.REGIONAL_MANAGER && (
                <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>المنطقة</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر منطقة" /></SelectTrigger></FormControl><SelectContent>{regions.map(r => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}

              <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button><Button type="submit">حفظ</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle><AlertDialogDescription>سيتم حذف المستخدم "{userToDelete?.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">حذف</AlertDialogAction></AlertDialogFooter>
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
