'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Violation } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS, ROLES } from '@/lib/permissions';

export default function ViolationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [violationToDelete, setViolationToDelete] = useState<Violation | null>(null);

  const permission = getPermission(user?.role, PERMISSIONS.VIOLATIONS);
  const canWrite = permission === 'write';

  useEffect(() => {
    async function fetchViolations() {
        try {
            const querySnapshot = await getDocs(collection(db, "violations"));
            const violationsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Violation[];
            setViolations(violationsData);
        } catch (error) {
            console.error('Failed to load violations from Firestore', error);
            toast({ variant: 'destructive', description: 'فشل في تحميل المخالفات.' });
        } finally {
            setIsLoaded(true);
        }
    }
    fetchViolations();
  }, [toast]);
  
  const filteredViolations = useMemo(() => {
    if (!user) return [];
    if (permission === 'read_own') {
      if (user.role === ROLES.BRANCH_MANAGER && user.branchId) {
        return violations.filter(v => v.branchId === user.branchId);
      }
      if (user.role === ROLES.REGIONAL_MANAGER && user.region) {
        return violations.filter(v => v.region === user.region);
      }
    }
    return violations;
  }, [violations, user, permission]);

  const handleDeleteClick = (violation: Violation) => {
    setViolationToDelete(violation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (violationToDelete) {
      try {
        await deleteDoc(doc(db, "violations", violationToDelete.id));
        setViolations(violations.filter(v => v.id !== violationToDelete.id));
        toast({ description: 'تم حذف المخالفة بنجاح.' });
      } catch (error) {
        console.error("Error deleting violation: ", error);
        toast({ variant: 'destructive', description: 'فشل في حذف المخالفة.' });
      } finally {
        setDeleteDialogOpen(false);
        setViolationToDelete(null);
      }
    }
  };

  if (!isLoaded) {
    return (
       <div className="flex flex-col gap-6">
        <PageHeader title="سجل المخالفات" />
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
        <PageHeader title="سجل المخالفات">
          {canWrite && (
            <Button asChild>
                <Link href="/violations/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                تسجيل مخالفة جديدة
                </Link>
            </Button>
          )}
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>جميع المخالفات</CardTitle>
            <CardDescription>
              قائمة بجميع مخالفات البلدية المسجلة على الفروع.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم المخالفة</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>تاريخ الرصد</TableHead>
                  <TableHead>آخر موعد للاعتراض</TableHead>
                  <TableHead>القيمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  {canWrite && <TableHead><span className="sr-only">Actions</span></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-medium">
                      {violation.violationNumber}
                    </TableCell>
                    <TableCell>{violation.branchName}</TableCell>
                    <TableCell>{violation.date}</TableCell>
                    <TableCell>{violation.lastObjectionDate || '—'}</TableCell>
                    <TableCell>
                      {violation.amount.toLocaleString('ar-SA', {
                        style: 'currency',
                        currency: 'SAR',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          violation.status === 'مدفوعة'
                            ? 'default'
                            : violation.status === 'غير مدفوعة'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="bg-opacity-20 text-opacity-100"
                      >
                        {violation.status}
                      </Badge>
                    </TableCell>
                    {canWrite && (
                        <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost" >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                            <DropdownMenuItem disabled>عرض التفاصيل</DropdownMenuItem>
                            <DropdownMenuItem disabled>تعديل</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(violation)} className="text-destructive focus:text-destructive">
                                <Trash2 className="ml-2 h-4 w-4" />
                                حذف
                            </DropdownMenuItem>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المخالفة رقم "{violationToDelete?.violationNumber}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
