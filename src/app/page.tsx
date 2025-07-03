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
  BarChart,
  DollarSign,
  FileText,
  Gavel,
  LineChart,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart as BarChartComponent, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import { recentViolations, violationsByBrand, violationsByStatus } from '@/lib/mock-data';
import { PageHeader } from '@/components/page-header';

const CHART_CONFIG_BRAND = {
  violations: {
    label: "المخالفات",
  },
  ...violationsByBrand.reduce((acc, { brand, fill }) => {
    acc[brand] = { label: brand, color: fill };
    return acc;
  }, {})
};

const CHART_CONFIG_STATUS = {
  violations: {
    label: "المخالفات",
  },
  ...violationsByStatus.reduce((acc, { status, fill }) => {
    acc[status] = { label: status, color: fill };
    return acc;
  }, {})
}

export default function Dashboard() {
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
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+15% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الغرامات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              450,231.89 <span className="text-sm">ريال</span>
            </div>
            <p className="text-xs text-muted-foreground">+20.1% عن الشهر الماضي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اعتراضات مفتوحة</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+72</div>
            <p className="text-xs text-muted-foreground">5 قيد المراجعة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأكثر تكراراً</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">نظافة عامة</div>
            <p className="text-xs text-muted-foreground">
              +19% عن الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>المخالفات حسب البراند</CardTitle>
            <CardDescription>
              عرض لعدد المخالفات المسجلة لكل براند خلال هذا العام.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={CHART_CONFIG_BRAND} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChartComponent data={violationsByBrand} layout="vertical" margin={{ right: 20 }}>
                  <XAxis type="number" dataKey="violations" hide />
                  <YAxis dataKey="brand" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="violations" radius={5}>
                    {violationsByBrand.map((entry) => (
                      <Cell key={`cell-${entry.brand}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChartComponent>
              </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>حالة المخالفات</CardTitle>
            <CardDescription>توزيع المخالفات حسب حالتها.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={CHART_CONFIG_STATUS} className="mx-auto aspect-square max-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={violationsByStatus} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={5}>
                       {violationsByStatus.map((entry) => (
                          <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                        ))}
                    </Pie>
                  </PieChart>
              </ResponsiveContainer>
             </ChartContainer>
          </CardContent>
        </Card>
      </div>
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
                  <TableCell className="font-medium">{violation.branch}</TableCell>
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
