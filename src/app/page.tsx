'use client';

import { useState, useEffect, useMemo } from 'react';
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
import {
  DollarSign,
  FileText,
  Gavel,
  LineChart,
} from 'lucide-react';
import { Violation, Objection } from '@/lib/mock-data';
import { PageHeader } from '@/components/page-header';
import { DashboardCharts } from '@/components/dashboard-charts';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';


export default function Dashboard() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const violationsSnapshot = await getDocs(collection(db, 'violations'));
        const violationsData = violationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Violation[];
        setViolations(violationsData);
        
        const objectionsSnapshot = await getDocs(collection(db, 'objections'));
        const objectionsData = objectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Objection[];
        setObjections(objectionsData);

      } catch (error) {
        console.error('Failed to fetch dashboard data from Firestore', error);
        toast({ variant: 'destructive', description: 'فشل في تحميل بيانات لوحة المعلومات.' });
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [toast]);

  const dashboardStats = useMemo(() => {
    const totalViolations = violations.length;
    const totalFines = violations.reduce((sum, v) => sum + v.amount, 0);
    const openObjections = objections.filter(o => o.status === 'قيد المراجعة').length;
    const allObjectionsCount = objections.length;
    
    const categoryCounts = violations.reduce((acc, v) => {
        const category = v.subCategory || 'غير محدد';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentViolation = Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)
        : 'لا يوجد';

    return {
      totalViolations,
      totalFines,
      openObjections,
      allObjectionsCount,
      mostFrequentViolation,
    };
  }, [violations, objections]);

  const recentViolations = useMemo(() => {
      return [...violations].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [violations]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="لوحة المعلومات" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-48 mt-1" />
                </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                 <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                 <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
            </Card>
            <Card className="lg:col-span-3">
                <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                <CardContent className="flex justify-center items-center"><Skeleton className="h-[300px] w-[300px] rounded-full" /></CardContent>
            </Card>
        </div>
         <Card>
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="لوحة المعلومات" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المخالفات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalViolations}</div>
            <p className="text-xs text-muted-foreground">مخالفة مسجلة في النظام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الغرامات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalFines.toLocaleString('ar-SA')} <span className="text-sm">ريال</span>
            </div>
            <p className="text-xs text-muted-foreground">قيمة جميع المخالفات المسجلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاعتراضات</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{dashboardStats.allObjectionsCount}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.openObjections} قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأكثر تكراراً</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{dashboardStats.mostFrequentViolation}</div>
            <p className="text-xs text-muted-foreground">
              الفئة الفرعية الأكثر تسجيلاً
            </p>
          </CardContent>
        </Card>
      </div>
      <DashboardCharts violations={violations}/>
      <Card>
        <CardHeader>
          <CardTitle>أحدث المخالفات</CardTitle>
          <CardDescription>
            قائمة بآخر 5 مخالفات تم تسجيلها في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الفرع</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>تاريخ الرصد</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentViolations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell className="font-medium">{violation.branchName}</TableCell>
                  <TableCell>{violation.city}</TableCell>
                  <TableCell>{violation.date}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
