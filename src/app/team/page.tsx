'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Star,
  Eye,
  Edit,
  Trash2,
  Settings,
  Download,
  Share2,
  UserPlus,
  Shield,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'مدير':
        return <Badge variant="default" className="bg-red-100 text-red-800">مدير</Badge>;
      case 'مطور':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">مطور</Badge>;
      case 'مصمم':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">مصمم</Badge>;
      case 'محلل':
        return <Badge variant="outline" className="bg-green-100 text-green-800">محلل</Badge>;
      default:
        return <Badge variant="outline">عضو</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'نشط':
        return <Badge variant="default" className="bg-green-100 text-green-800">نشط</Badge>;
      case 'غير نشط':
        return <Badge variant="destructive">غير نشط</Badge>;
      case 'إجازة':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">إجازة</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الفريق</h1>
              <p className="text-gray-600">إدارة أعضاء الفريق والصلاحيات</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                مشاركة
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                إضافة عضو
              </Button>
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">+2 عضو جديد هذا الشهر</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الأعضاء النشطين</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter(m => m.status === 'نشط').length}
              </div>
              <p className="text-xs text-muted-foreground">أعضاء نشطين</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">مشاريع قيد التنفيذ</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإنتاجية</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% من الشهر الماضي</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الأعضاء..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  فلتر
                </Button>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الأدوار</option>
                  <option value="مدير">مدير</option>
                  <option value="مطور">مطور</option>
                  <option value="مصمم">مصمم</option>
                  <option value="محلل">محلل</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="نشط">نشط</option>
                  <option value="غير نشط">غير نشط</option>
                  <option value="إجازة">إجازة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>أعضاء الفريق</CardTitle>
                <CardDescription>
                  {filteredMembers.length} عضو من أصل {teamMembers.length}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  عرض
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>العضو</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>المشاريع</TableHead>
                  <TableHead>المهام</TableHead>
                  <TableHead>معدل الإنجاز</TableHead>
                  <TableHead>آخر نشاط</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(member.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{member.activeProjects}</span>
                        <span className="text-xs text-gray-500">مشروع</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{member.activeTasks}</span>
                        <span className="text-xs text-gray-500">مهمة</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${member.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{member.completionRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{member.lastActivity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            عرض الملف الشخصي
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل العضو
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            إدارة الصلاحيات
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            إرسال رسالة
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            إزالة العضو
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Team Roles and Permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>الأدوار والصلاحيات</CardTitle>
              <CardDescription>إدارة أدوار الأعضاء وصلاحياتهم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${role.color}`}></div>
                      <div>
                        <p className="font-medium text-sm">{role.name}</p>
                        <p className="text-xs text-gray-500">{role.members} عضو</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      الصلاحيات
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الفريق</CardTitle>
              <CardDescription>نظرة عامة على أداء الفريق</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">إجمالي ساعات العمل</span>
                  <span className="text-sm font-medium">1,247 ساعة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">المهام المكتملة</span>
                  <span className="text-sm font-medium">89 مهمة</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">المشاريع النشطة</span>
                  <span className="text-sm font-medium">8 مشاريع</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">معدل الرضا</span>
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const teamMembers = [
  {
    id: "MEMBER-001",
    name: "أحمد محمد",
    email: "ahmed.mohamed@company.com",
    initials: "AM",
    role: "مدير",
    status: "نشط",
    activeProjects: 3,
    activeTasks: 12,
    completionRate: 85,
    lastActivity: "منذ ساعتين"
  },
  {
    id: "MEMBER-002",
    name: "سارة أحمد",
    email: "sara.ahmed@company.com",
    initials: "SA",
    role: "مطور",
    status: "نشط",
    activeProjects: 2,
    activeTasks: 8,
    completionRate: 92,
    lastActivity: "منذ 30 دقيقة"
  },
  {
    id: "MEMBER-003",
    name: "محمد علي",
    email: "mohamed.ali@company.com",
    initials: "MA",
    role: "مطور",
    status: "نشط",
    activeProjects: 4,
    activeTasks: 15,
    completionRate: 78,
    lastActivity: "منذ ساعة"
  },
  {
    id: "MEMBER-004",
    name: "فاطمة حسن",
    email: "fatima.hassan@company.com",
    initials: "FH",
    role: "مصمم",
    status: "نشط",
    activeProjects: 2,
    activeTasks: 6,
    completionRate: 95,
    lastActivity: "منذ 15 دقيقة"
  },
  {
    id: "MEMBER-005",
    name: "علي كريم",
    email: "ali.karim@company.com",
    initials: "AK",
    role: "محلل",
    status: "إجازة",
    activeProjects: 1,
    activeTasks: 3,
    completionRate: 60,
    lastActivity: "منذ يومين"
  },
  {
    id: "MEMBER-006",
    name: "نورا محمد",
    email: "nora.mohamed@company.com",
    initials: "NM",
    role: "مصمم",
    status: "نشط",
    activeProjects: 3,
    activeTasks: 10,
    completionRate: 88,
    lastActivity: "منذ ساعة"
  }
];

const roles = [
  {
    name: "مدير",
    members: 1,
    color: "bg-red-500"
  },
  {
    name: "مطور",
    members: 2,
    color: "bg-blue-500"
  },
  {
    name: "مصمم",
    members: 2,
    color: "bg-purple-500"
  },
  {
    name: "محلل",
    members: 1,
    color: "bg-green-500"
  }
];