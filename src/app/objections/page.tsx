'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Upload, Paperclip } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Objection, Violation, Attachment } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS, ROLES } from '@/lib/permissions';

const objectionSchema = z.object({
  violationId: z.string({ required_error: 'الرجاء اختيار مخالفة.' }),
  details: z.string().min(10, 'الرجاء كتابة تفاصيل الاعتراض (10 أحرف على الأقل).'),
});

type ObjectionFormValues = z.infer<typeof objectionSchema>;

export default function ObjectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectionToDelete, setObjectionToDelete] = useState<Objection | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const permission = getPermission(user?.role, PERMISSIONS.OBJECTIONS);
  const canWrite = permission === 'write';

  useEffect(() => {
    async function fetchData() {
        try {
            const objectionsSnapshot = await getDocs(collection(db, 'objections'));
            const allObjections = objectionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Objection[];
            
            // Add branchId and region to objections if they don't exist for filtering
            const violationsSnapshot = await getDocs(collection(db, 'violations'));
            const allViolations = violationsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Violation[];
            setViolations(allViolations);
            
            const objectionsWithDetails = allObjections.map(o => {
                const v = allViolations.find(v => v.id === o.violationId);
                return {
                    ...o,
                    branchId: v?.branchId || '',
                    region: v?.region || '',
                }
            })
            setObjections(objectionsWithDetails);

        } catch (error) {
            console.error('Failed to load data from Firestore', error);
            toast({ variant: 'destructive', description: 'فشل تحميل البيانات من قاعدة البيانات.' });
        } finally {
            setIsLoaded(true);
        }
    }
    fetchData();
  }, [toast]);
  
  const filteredObjections = useMemo(() => {
    if (!user) return [];
    if (permission === 'read_own') {
      if (user.role === ROLES.BRANCH_MANAGER && user.branchId) {
        return objections.filter(o => o.branchId === user.branchId);
      }
      if (user.role === ROLES.REGIONAL_MANAGER && user.region) {
        return objections.filter(o => o.region === user.region);
      }
    }
    return objections;
  }, [objections, user, permission]);

  const form = useForm<ObjectionFormValues>({
    resolver: zodResolver(objectionSchema),
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        setAttachments(Array.from(event.target.files));
    }
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAttachments([]);
    form.reset();
  };

  const onSubmit = async (values: ObjectionFormValues) => {
    const violation = violations.find(v => v.id === values.violationId);
    if (!violation) {
        toast({ variant: 'destructive', description: 'المخالفة المحددة غير موجودة.' });
        return;
    }
    
    // NOTE: File upload to Firebase Storage would be implemented here in a real app.
    // For this prototype, we'll just save the file names.
    const attachmentData: Attachment[] = attachments.map(file => ({ name: file.name, type: file.type }));

    try {
        const newObjectionData = {
            number: `OBJ-${String(objections.length + 1).padStart(3, '0')}`,
            violationId: violation.id,
            violationNumber: violation.violationNumber,
            branch: violation.branchName,
            date: new Date().toISOString().split('T')[0],
            status: 'قيد المراجعة' as const,
            details: values.details,
            attachments: attachmentData,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, 'objections'), newObjectionData);
        
        // Refetch to update list correctly
        const newDoc = { ...newObjectionData, id: docRef.id, branchId: violation.branchId, region: violation.region };
        setObjections([ newDoc, ...objections ]);
        toast({ description: 'تم تسجيل الاعتراض بنجاح.' });
        handleCloseDialog();
    } catch (error) {
        console.error("Error saving objection:", error);
        toast({ variant: 'destructive', description: 'فشل في حفظ الاعتراض.' });
    }
  };

  const handleDeleteClick = (objection: Objection) => {
    setObjectionToDelete(objection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (objectionToDelete) {
        try {
            await deleteDoc(doc(db, "objections", objectionToDelete.id));
            setObjections(objections.filter(o => o.id !== objectionToDelete.id));
            toast({ description: 'تم حذف الاعتراض بنجاح.' });
        } catch (error) {
            console.error("Error deleting objection: ", error);
            toast({ variant: 'destructive', description: 'فشل في حذف الاعتراض.' });
        } finally {
            setDeleteDialogOpen(false);
            setObjectionToDelete(null);
        }
    }
  };

  const handleStatusChange = async (objectionId: string, status: Objection['status']) => {
    try {
        const objectionRef = doc(db, 'objections', objectionId);
        await updateDoc(objectionRef, { status: status });
        setObjections(objections.map(o => o.id === objectionId ? { ...o, status } : o));
        toast({ description: `تم تغيير حالة الاعتراض إلى "${status}".`});
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ variant: 'destructive', description: 'فشل في تحديث الحالة.' });
    }
  };

  if (!isLoaded) {
    return (
       <div className="flex flex-col gap-6">
        <PageHeader title="متابعة الاعتراضات" />
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
        <PageHeader title="متابعة الاعتراضات">
          {canWrite && (
            <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                تسجيل اعتراض جديد
            </Button>
          )}
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>قائمة الاعتراضات</CardTitle>
            <CardDescription>
              عرض وتتبع جميع الاعتراضات المقدمة على المخالفات.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الاعتراض</TableHead>
                  <TableHead>رقم المخالفة</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>تاريخ الاعتراض</TableHead>
                  <TableHead>المرفقات</TableHead>
                  <TableHead>الحالة</TableHead>
                  {canWrite && <TableHead><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredObjections.map((objection) => (
                  <TableRow key={objection.id}>
                    <TableCell className="font-medium">{objection.number}</TableCell>
                    <TableCell>{objection.violationNumber}</TableCell>
                    <TableCell>{objection.branch}</TableCell>
                    <TableCell>{objection.date}</TableCell>
                    <TableCell>
                      {objection.attachments && objection.attachments.length > 0 ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                              <Paperclip className="h-4 w-4" />
                              <span>{objection.attachments.length}</span>
                          </div>
                      ) : (
                          <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          objection.status === 'مقبول'
                            ? 'default'
                            : objection.status === 'مرفوض'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {objection.status}
                      </Badge>
                    </TableCell>
                    {canWrite && (
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'قيد المراجعة')}>قيد المراجعة</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'مقبول')}>مقبول</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'مرفوض')}>مرفوض</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(objection)}>حذف</DropdownMenuItem>
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
            <DialogTitle>تسجيل اعتراض جديد</DialogTitle>
            <DialogDescription>
              اختر المخالفة التي ترغب بالاعتراض عليها وأدخل تفاصيل الاعتراض.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="violationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المخالفة</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر رقم المخالفة..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {violations.map((v) => (<SelectItem key={v.id} value={v.id}>{`${v.violationNumber} - ${v.branchName}`}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تفاصيل الاعتراض</FormLabel>
                      <FormControl>
                        <Textarea placeholder="اشرح أسباب اعتراضك هنا..." {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                    <FormLabel>المرفقات (اختياري)</FormLabel>
                     <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت</p>
                                <p className="text-xs text-muted-foreground">صورة, فيديو, PDF</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
                        </label>
                    </div>
                     {attachments.length > 0 && (
                        <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">الملفات المختارة:</p>
                            <ul className="list-disc list-inside">
                                {attachments.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>إلغاء</Button>
                <Button type="submit">حفظ الاعتراض</Button>
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
              سيتم حذف الاعتراض رقم "{objectionToDelete?.number}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
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
