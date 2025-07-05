'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Upload, Paperclip, CalendarIcon } from 'lucide-react';
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
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, writeBatch } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const objectionSchema = z.object({
  number: z.string().min(1, 'Number is required.'),
  date: z.date({ required_error: 'Date is required.' }),
  violationId: z.string({ required_error: 'Violation is required.' }),
  details: z.string().min(10, 'Details must be at least 10 characters.'),
});

type ObjectionFormValues = z.infer<typeof objectionSchema>;

export default function ObjectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectionToDelete, setObjectionToDelete] = useState<Objection | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const permission = getPermission(user?.role, PERMISSIONS.OBJECTIONS);
  const canWrite = permission === 'write';

  useEffect(() => {
    async function fetchData() {
        try {
            const [objectionsSnapshot, violationsSnapshot] = await Promise.all([
                getDocs(collection(db, 'objections')),
                getDocs(collection(db, 'violations'))
            ]);

            const allObjections = objectionsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Objection[];
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
            toast({ variant: 'destructive', description: t('objections.toasts.loadError') });
        } finally {
            setIsLoaded(true);
        }
    }
    fetchData();
  }, [toast, t]);
  
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

  const translatedObjectionSchema = useMemo(() => {
    return z.object({
      number: z.string().min(1, t('objections.toasts.numberRequired')),
      date: z.date({ required_error: t('objections.toasts.dateRequired') }),
      violationId: z.string({ required_error: t('objections.toasts.violationRequired') }),
      details: z.string().min(10, t('objections.toasts.detailsRequired')),
    });
  }, [t]);

  const form = useForm<ObjectionFormValues>({
    resolver: zodResolver(translatedObjectionSchema),
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const allFiles = Array.from(event.target.files);
      const validFiles = allFiles.filter(file => file.size <= maxFileSize);
      const oversizedFiles = allFiles.filter(file => file.size > maxFileSize);

      if (oversizedFiles.length > 0) {
        toast({
          variant: 'destructive',
          title: t('objections.toasts.fileSizeErrorTitle'),
          description: t('objections.toasts.fileSizeErrorDesc', { count: oversizedFiles.length }),
        });
      }
      setAttachments(validFiles);
    }
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setAttachments([]);
    form.reset();
  };

  const onSubmit = async (values: ObjectionFormValues) => {
    setIsSubmitting(true);
    const violation = violations.find(v => v.id === values.violationId);
    if (!violation) {
        toast({ variant: 'destructive', description: t('objections.toasts.violationNotFound') });
        setIsSubmitting(false);
        return;
    }
    
    const newObjectionRef = doc(collection(db, 'objections'));
    const objectionId = newObjectionRef.id;

    try {
        const attachmentPromises = attachments.map(async (file) => {
          const storage = getStorage();
          const storageRef = ref(storage, `objections/${objectionId}/${Date.now()}-${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          return { name: file.name, type: file.type, url: downloadUrl };
        });

        const attachmentData: Attachment[] = await Promise.all(attachmentPromises);

        const newObjectionData = {
            number: values.number,
            violationId: violation.id,
            violationNumber: violation.violationNumber,
            branch: violation.branchName,
            date: format(values.date, 'yyyy-MM-dd'),
            status: 'pending' as const,
            details: values.details,
            attachments: attachmentData,
            createdAt: serverTimestamp(),
        };

        await setDoc(newObjectionRef, newObjectionData);
        
        const newDocData = {
          ...newObjectionData,
          createdAt: new Date()
        };

        const newDoc = { ...newDocData, id: objectionId, branchId: violation.branchId, region: violation.region } as unknown as Objection;
        setObjections([ newDoc, ...objections ]);
        toast({ description: t('objections.toasts.saveSuccess') });
        handleCloseDialog();
    } catch (error) {
        console.error("Error saving objection:", error);
        toast({ variant: 'destructive', description: t('objections.toasts.saveError') });
    } finally {
        setIsSubmitting(false);
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
            toast({ description: t('objections.toasts.deleteSuccess') });
        } catch (error) {
            console.error("Error deleting objection: ", error);
            toast({ variant: 'destructive', description: t('objections.toasts.deleteError') });
        } finally {
            setDeleteDialogOpen(false);
            setObjectionToDelete(null);
        }
    }
  };

  const handleStatusChange = async (objectionId: string, status: Objection['status']) => {
    const objection = objections.find(o => o.id === objectionId);
    if (!objection) {
        toast({ variant: 'destructive', description: t('objections.toasts.violationNotFound') });
        return;
    }

    try {
        const batch = writeBatch(db);
        const objectionRef = doc(db, 'objections', objectionId);
        batch.update(objectionRef, { status: status });

        if (status === 'approved') {
            const violationRef = doc(db, 'violations', objection.violationId);
            batch.update(violationRef, { status: 'filed' });
        }

        await batch.commit();

        setObjections(objections.map(o => o.id === objectionId ? { ...o, status } : o));
        
        if (status === 'approved') {
            toast({ description: t('objections.toasts.statusApproved') });
        } else {
            toast({ description: t('objections.toasts.statusChanged', { status: t(`objectionStatuses.${status}`) })});
        }
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ variant: 'destructive', description: t('objections.toasts.statusUpdateError') });
    }
  };

  if (!isLoaded) {
    return (
       <div className="flex flex-col gap-6">
        <PageHeader title={t('objections.title')} />
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
        <PageHeader title={t('objections.title')}>
          {canWrite && (
            <Button onClick={() => setDialogOpen(true)}>
                <PlusCircle className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                {t('objections.addNew')}
            </Button>
          )}
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>{t('objections.listTitle')}</CardTitle>
            <CardDescription>{t('objections.listDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('objections.table.number')}</TableHead>
                  <TableHead>{t('objections.table.violationNumber')}</TableHead>
                  <TableHead>{t('objections.table.branch')}</TableHead>
                  <TableHead>{t('objections.table.date')}</TableHead>
                  <TableHead>{t('objections.table.attachments')}</TableHead>
                  <TableHead>{t('objections.table.status')}</TableHead>
                  {canWrite && <TableHead><span className="sr-only">{t('nav.actions')}</span></TableHead>}
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
                          objection.status === 'approved'
                            ? 'default'
                            : objection.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {t(`objectionStatuses.${objection.status}`)}
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
                                    <DropdownMenuLabel>{t('objections.statusMenu.changeStatus')}</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'pending')}>{t('objectionStatuses.pending')}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'approved')}>{t('objectionStatuses.approved')}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(objection.id, 'rejected')}>{t('objectionStatuses.rejected')}</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(objection)}>{t('common.delete')}</DropdownMenuItem>
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

       <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('objections.dialog.title')}</DialogTitle>
            <DialogDescription>{t('objections.dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>{t('objections.dialog.number')}</FormLabel><FormControl><Input placeholder={t('objections.dialog.numberPlaceholder')} {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="date" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>{t('objections.dialog.date')}</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left rtl:text-right font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>{t('objections.dialog.selectDate')}</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                </div>
                <FormField
                  control={form.control}
                  name="violationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('objections.dialog.violation')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('objections.dialog.selectViolation')} />
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
                      <FormLabel>{t('objections.dialog.details')}</FormLabel>
                      <FormControl>
                        <Textarea placeholder={t('objections.dialog.detailsPlaceholder')} {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                    <FormLabel>{t('objections.dialog.attachments')}</FormLabel>
                     <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t('objections.dialog.dropzoneHint')}</span></p>
                                <p className="text-xs text-muted-foreground">{t('objections.dialog.dropzoneMeta')}</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} accept="*" />
                        </label>
                    </div>
                     {attachments.length > 0 && (
                        <div className="space-y-1 pt-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">{t('objections.dialog.selectedFiles')}</p>
                            <ul className="list-disc list-inside">
                                {attachments.map((file, index) => (
                                    <li key={index}>{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>{t('common.cancel')}</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('objections.deleteDialog.description', { objectionNumber: objectionToDelete?.number })}
            </AlertDialogDescription>
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
