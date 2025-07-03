"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { violationsByBrand, violationsByStatus } from '@/lib/mock-data';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const CHART_CONFIG_BRAND = {
  violations: {
    label: "المخالفات",
  },
  ...violationsByBrand.reduce((acc, { brand, fill }) => {
    acc[brand] = { label: brand, color: fill };
    return acc;
  }, {} as any)
};

const CHART_CONFIG_STATUS = {
  violations: {
    label: "المخالفات",
  },
  ...violationsByStatus.reduce((acc, { status, fill }) => {
    acc[status] = { label: status, color: fill };
    return acc;
  }, {} as any)
}

export function DashboardCharts() {
  return (
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
              <BarChart data={violationsByBrand} layout="vertical" margin={{ right: 20 }}>
                <XAxis type="number" dataKey="violations" hide />
                <YAxis dataKey="brand" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="violations" radius={5}>
                  {violationsByBrand.map((entry) => (
                    <Cell key={`cell-${entry.brand}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
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
  );
}
