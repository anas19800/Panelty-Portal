'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Upload, Paperclip } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  objections as initialObjections,
  violations as initialViolations,
  Objection,
  Violation,
  Attachment,
} from '@/lib/mock-data';

const objectionSchema = z.object({
  violationId: z.string({ required_error: 'الرجاء اختيار مخالفة.' }),
  details: z.string().min(10, 'الرجاء كتابة تفاصيل الاعتراض (10 أحرف على الأقل).'),
});

type ObjectionFormValues = z.infer<typeof objectionSchema>;

export default function ObjectionsPage() {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [objectionToDelete, setObjectionToDelete] = useState<Objection | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    try {
      const storedObjections = localStorage.getItem('objections');
      const storedViolations = localStorage.getItem('violations');
      setObjections(storedObjections ? JSON.parse(storedObjections) : initialObjections);
      setViolations(storedViolations ? JSON.parse(storedViolations) : initialViolations);
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setObjections(initialObjections);
      setViolations(initialViolations);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('objections', JSON.stringify(objections));
      } catch (error) {
        console.error('Failed to save objections to localStorage', error);
        toast({ variant: 'destructive', description: 'فشل في حفظ بيانات الاعتراضات.' });
      }
    }
  }, [objections, isLoaded, toast]);

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

  const onSubmit = (values: ObjectionFormValues) => {
    const violation = violations.find(v => v.id === values.violationId);
    if (!violation) {
        toast({ variant: 'destructive', description: 'المخالفة المحددة غير موجودة.' });
        return;
    }

    const newObjection: Objection = {
        id: `o${new Date().getTime()}`,
        number: `OBJ-${String(objections.length + 1).padStart(3, '0')}`,
        violationId: violation.id,
        violationNumber: violation.violationNumber,
        branch: violation.branchName,
        date: new Date().toISOString().split('T')[0],
        status: 'قيد المراجعة',
        details: values.details,
        attachments: attachments.map(file => ({ name: file.name, type: file.type })),
    };
    
    setObjections([newObjection, ...objections]);
    toast({ description: 'تم تسجيل الاعتراض بنجاح.' });
    handleCloseDialog();
  };

  const handleDeleteClick = (objection: Objection) => {
    setObjectionToDelete(objection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (objectionToDelete) {
      setObjections(objections.filter(o => o.id !== objectionToDelete.id));
      toast({ description: 'تم حذف الاعتراض بنجاح.' });
      setDeleteDialogOpen(false);
      setObjectionToDelete(null);
    }
  };

  const handleStatusChange = (objectionId: string, status: Objection['status']) => {
    setObjections(objections.map(o => o.id === objectionId ? { ...o, status } : o));
    toast({ description: `تم تغيير حالة الاعتراض إلى "${status}".`});
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
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            تسجيل اعتراض جديد
          </Button>
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
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {objections.map((objection) => (
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
