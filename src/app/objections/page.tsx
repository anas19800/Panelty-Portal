import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

const objections = [
    { id: 'o1', number: 'OBJ-001', violationNumber: 'V-003', branch: 'فرع الخبر', date: '2024-05-12', status: 'مقبول' },
    { id: 'o2', number: 'OBJ-002', violationNumber: 'V-005', branch: 'فرع الياسمين', date: '2024-05-18', status: 'قيد المراجعة' },
    { id: 'o3', number: 'OBJ-003', violationNumber: 'V-002', branch: 'فرع التحلية', date: '2024-05-20', status: 'مرفوض' },
];

export default function ObjectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="متابعة الاعتراضات">
        <Button>
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
                <TableHead>الحالة</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
