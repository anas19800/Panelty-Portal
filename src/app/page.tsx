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
import { DollarSign, FileText, Gavel, LineChart } from 'lucide-react';
import { Violation, Objection, User, Branch } from '@/lib/mock-data';
import { PageHeader } from '@/components/page-header';
import { DashboardCharts } from '@/components/dashboard-charts';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { getPermission, PERMISSIONS, ROLES } from '@/lib/permissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Dashboard() {
  const { user } = useAuth();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  // State for filters
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const permission = getPermission(user.role, PERMISSIONS.DASHBOARD);
        let violationsQuery = collection(db, 'violations');
        let objectionsQuery = collection(db, 'objections');

        if (permission === 'read_own') {
          if (user.role === ROLES.BRANCH_MANAGER && user.branchId) {
            // @ts-ignore
            violationsQuery = query(violationsQuery, where('branchId', '==', user.branchId));
            // @ts-ignore
            objectionsQuery = query(objectionsQuery, where('branchId', '==', user.branchId));
          } else if (user.role === ROLES.REGIONAL_MANAGER && user.region) {
            // @ts-ignore
            violationsQuery = query(violationsQuery, where('region', '==', user.region));
            // @ts-ignore
            objectionsQuery = query(objectionsQuery, where('region', '==', user.region));
          }
        }

        const violationsSnapshot = await getDocs(violationsQuery);
        const violationsData = violationsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Violation[];
        setViolations(violationsData);

        const objectionsSnapshot = await getDocs(objectionsQuery);
        const objectionsData = objectionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Objection[];
        setObjections(objectionsData);

        // Fetch data for filters
        const regionsSnapshot = await getDocs(collection(db, 'regions'));
        setRegions(regionsSnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));

        const brandsSnapshot = await getDocs(collection(db, 'brands'));
        setBrands(brandsSnapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name })));

        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        const branchesData = branchesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Branch[];
        setAllBranches(branchesData);

        const uniqueCities = [...new Set(branchesData.map((b) => b.city))].sort();
        setCities(uniqueCities);

        const uniqueYears = [...new Set(violationsData.map((v) => new Date(v.date).getFullYear().toString())),].sort((a, b) => parseInt(b) - parseInt(a));
        setYears(uniqueYears);

      } catch (error) {
        console.error('Failed to fetch dashboard data from Firestore', error);
        toast({ variant: 'destructive', description: 'فشل في تحميل بيانات لوحة المعلومات.' });
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [user, toast]);

  const filteredData = useMemo(() => {
    const filteredViolations = violations.filter(
      (v) =>
        (selectedRegion === 'all' || v.region === selectedRegion) &&
        (selectedBrand === 'all' || v.brand === selectedBrand) &&
        (selectedCity === 'all' || v.city === selectedCity) &&
        (selectedBranch === 'all' || v.branchId === selectedBranch) &&
        (selectedYear === 'all' || new Date(v.date).getFullYear().toString() === selectedYear) &&
        (selectedStatus === 'all' || v.status === selectedStatus)
    );

    const filteredObjections = objections
      .map((o) => {
        const violation = violations.find((v) => v.id === o.violationId);
        return {
          ...o,
          region: violation?.region,
          brand: violation?.brand,
          city: violation?.city,
          branchId: violation?.branchId,
          violationDate: violation?.date,
        };
      })
      .filter(
        (o) =>
          (selectedRegion === 'all' || o.region === selectedRegion) &&
          (selectedBrand === 'all' || o.brand === selectedBrand) &&
          (selectedCity === 'all' || o.city === selectedCity) &&
          (selectedBranch === 'all' || o.branchId === selectedBranch) &&
          (selectedYear === 'all' || (o.violationDate && new Date(o.violationDate).getFullYear().toString() === selectedYear))
      );

    return { filteredViolations, filteredObjections };
  }, [violations, objections, selectedRegion, selectedBrand, selectedCity, selectedBranch, selectedYear, selectedStatus]);

  const dashboardStats = useMemo(() => {
    const { filteredViolations, filteredObjections } = filteredData;
    const totalViolations = filteredViolations.length;
    const totalFines = filteredViolations.reduce((sum, v) => sum + v.amount, 0);
    const openObjections = filteredObjections.filter((o) => o.status === 'قيد المراجعة').length;
    const allObjectionsCount = filteredObjections.length;

    const categoryCounts = filteredViolations.reduce((acc, v) => {
      const category = v.subCategory || 'غير محدد';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentViolation =
      Object.keys(categoryCounts).length > 0
        ? Object.keys(categoryCounts).reduce((a, b) =>
            categoryCounts[a] > categoryCounts[b] ? a : b
          )
        : 'لا يوجد';

    return {
      totalViolations,
      totalFines,
      openObjections,
      allObjectionsCount,
      mostFrequentViolation,
    };
  }, [filteredData]);

  const recentViolations = useMemo(() => {
    return [...filteredData.filteredViolations]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredData]);

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
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="flex justify-center items-center">
              <Skeleton className="h-[300px] w-[300px] rounded-full" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="لوحة المعلومات" />
      <Card>
        <CardHeader>
          <CardTitle>فلاتر</CardTitle>
          <CardDescription>تصفية البيانات المعروضة في لوحة المعلومات.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <div className="grid gap-2">
              <Label htmlFor="region-filter">المنطقة</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {regions.map((r) => (<SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brand-filter">البراند</Label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger id="brand-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {brands.map((b) => (<SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city-filter">المدينة</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger id="city-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {cities.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch-filter">الفرع</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger id="branch-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {allBranches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="year-filter">السنة</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {years.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status-filter">حالة المخالفة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status-filter"><SelectValue placeholder="الكل" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="مدفوعة">مدفوعة</SelectItem>
                  <SelectItem value="غير مدفوعة">غير مدفوعة</SelectItem>
                  <SelectItem value="ملفية">ملفية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
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
            <p className="text-xs text-muted-foreground">الفئة الفرعية الأكثر تسجيلاً</p>
          </CardContent>
        </Card>
      </div>
      <DashboardCharts violations={filteredData.filteredViolations} />
      <Card>
        <CardHeader>
          <CardTitle>أحدث المخالفات</CardTitle>
          <CardDescription>قائمة بآخر 5 مخالفات تم تسجيلها في النظام.</CardDescription>
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
