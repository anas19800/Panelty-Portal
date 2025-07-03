"use client";

import React from 'react';
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
import { Violation } from '@/lib/mock-data';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const PALETTE = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

type ChartData = {
    name: string;
    value: number;
    fill: string;
}

export function DashboardCharts({ violations }: { violations: Violation[] }) {
  
  const violationsByBrand = React.useMemo(() => {
    const brandCounts = violations.reduce((acc, v) => {
        acc[v.brand] = (acc[v.brand] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCounts).map(([brand, count], index) => ({
        brand,
        violations: count,
        fill: PALETTE[index % PALETTE.length],
    }));
  }, [violations]);

  const violationsByStatus = React.useMemo(() => {
    const statusCounts = violations.reduce((acc, v) => {
        acc[v.status] = (acc[v.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusColorMap: Record<string, string> = {
        'مدفوعة': 'var(--color-chart-2)',
        'غير مدفوعة': 'var(--color-chart-5)',
        'ملفية': 'var(--color-chart-3)',
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        fill: statusColorMap[status] || PALETTE[3],
    }));
  }, [violations]);

  const chartConfigBrand = {
    violations: { label: "المخالفات" },
    ...violationsByBrand.reduce((acc, { brand, fill }) => {
        acc[brand] = { label: brand, color: fill };
        return acc;
    }, {} as any)
  };

  const chartConfigStatus = {
    violations: { label: "المخالفات" },
     ...violationsByStatus.reduce((acc, { status, fill }) => {
        acc[status] = { label: status, color: fill };
        return acc;
    }, {} as any)
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>المخالفات حسب البراند</CardTitle>
          <CardDescription>
            عرض لعدد المخالفات المسجلة لكل براند.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={chartConfigBrand} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={violationsByBrand} layout="vertical" margin={{ right: 40, left: 30 }}>
                <XAxis type="number" dataKey="violations" hide />
                <YAxis dataKey="brand" type="category" tickLine={false} axisLine={false} tickMargin={10} width={150} />
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
           <ChartContainer config={chartConfigStatus} className="mx-auto aspect-square max-h-[300px]">
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
