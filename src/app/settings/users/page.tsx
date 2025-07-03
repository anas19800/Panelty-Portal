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
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const users = [
    { id: 'u1', name: 'عبدالله الصالح', role: 'مسؤول جودة', status: 'نشط' },
    { id: 'u2', name: 'فاطمة حمد', role: 'مدير إقليمي', status: 'نشط' },
    { id: 'u3', name: 'سعد العتيبي', role: 'مدير فرع', status: 'غير نشط' },
    { id: 'u4', name: 'علي الأحمد', role: 'إدارة عليا', status: 'نشط' },
    { id: 'u5', name: 'نورة السالم', role: 'مسؤول نظام', status: 'نشط' },
];

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="إدارة المستخدمين والصلاحيات">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          إضافة مستخدم
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            إدارة حسابات المستخدمين والتحكم في صلاحياتهم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'نشط' ? 'default' : 'outline'}>
                      {user.status}
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
                        <DropdownMenuItem>تعديل الصلاحيات</DropdownMenuItem>
                        <DropdownMenuItem>تعطيل المستخدم</DropdownMenuItem>
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
