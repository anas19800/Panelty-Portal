import Link from 'next/link';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { violations } from '@/lib/mock-data';

export default function ViolationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="سجل المخالفات">
        <Button asChild>
          <Link href="/violations/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            تسجيل مخالفة جديدة
          </Link>
        </Button>
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
                <TableHead>المدينة</TableHead>
                <TableHead>تاريخ الرصد</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell className="font-medium">
                    {violation.violationNumber}
                  </TableCell>
                  <TableCell>{violation.branchName}</TableCell>
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
                      className='bg-opacity-20 text-opacity-100'
                    >
                      {violation.status}
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
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                        <DropdownMenuItem>تسجيل اعتراض</DropdownMenuItem>
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
  );
}
