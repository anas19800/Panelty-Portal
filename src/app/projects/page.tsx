'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المشاريع</h1>
              <p className="text-gray-600">إدارة جميع مشاريعك ومهامك</p>
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
                <Plus className="h-4 w-4 mr-2" />
                مشروع جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في المشاريع..."
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
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="completed">مكتمل</option>
                  <option value="paused">معلق</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>قائمة المشاريع</CardTitle>
                <CardDescription>
                  {filteredProjects.length} مشروع من أصل {projects.length}
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
                  <TableHead>اسم المشروع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>أعضاء الفريق</TableHead>
                  <TableHead>تاريخ الإنتهاء</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-gray-500">#{project.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {project.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>{project.progress}%</span>
                          <span>{project.completedTasks}/{project.totalTasks} مهام</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          project.status === 'active' ? 'default' : 
                          project.status === 'completed' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {project.status === 'active' ? 'نشط' : 
                         project.status === 'completed' ? 'مكتمل' : 'معلق'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 3).map((member, memberIndex) => (
                          <Avatar key={memberIndex} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members.length > 3 && (
                          <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{project.deadline}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`w-2 h-2 rounded-full ${
                        project.priority === 'high' ? 'bg-red-500' : 
                        project.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
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
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل المشروع
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            إدارة الأعضاء
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف المشروع
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">+3 مشاريع جديدة هذا الشهر</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع النشطة</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">مشاريع قيد التنفيذ</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المشاريع المكتملة</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">مشاريع منجزة</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)}%
              </div>
              <p className="text-xs text-muted-foreground">متوسط التقدم العام</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const projects = [
  {
    id: "PRJ-001",
    name: "تطوير تطبيق الموبايل",
    description: "تطوير تطبيق iOS و Android للعملاء مع واجهة مستخدم حديثة",
    progress: 75,
    completedTasks: 18,
    totalTasks: 24,
    color: "bg-blue-500",
    status: "active",
    priority: "high",
    deadline: "15 يوم متبقي",
    members: [
      { initials: "AM", name: "أحمد محمد" },
      { initials: "SA", name: "سارة أحمد" },
      { initials: "MA", name: "محمد علي" },
      { initials: "FH", name: "فاطمة حسن" }
    ]
  },
  {
    id: "PRJ-002",
    name: "إعادة تصميم الموقع",
    description: "تحديث واجهة المستخدم وتحسين الأداء وسرعة التحميل",
    progress: 45,
    completedTasks: 9,
    totalTasks: 20,
    color: "bg-green-500",
    status: "active",
    priority: "medium",
    deadline: "8 أيام متبقي",
    members: [
      { initials: "AM", name: "أحمد محمد" },
      { initials: "SA", name: "سارة أحمد" }
    ]
  },
  {
    id: "PRJ-003",
    name: "حملة التسويق الرقمي",
    description: "إطلاق حملة تسويقية شاملة عبر وسائل التواصل الاجتماعي",
    progress: 90,
    completedTasks: 27,
    totalTasks: 30,
    color: "bg-purple-500",
    status: "active",
    priority: "high",
    deadline: "3 أيام متبقي",
    members: [
      { initials: "AM", name: "أحمد محمد" },
      { initials: "SA", name: "سارة أحمد" },
      { initials: "MA", name: "محمد علي" }
    ]
  },
  {
    id: "PRJ-004",
    name: "تطوير نظام إدارة المحتوى",
    description: "إنشاء نظام متكامل لإدارة المحتوى والمدونات",
    progress: 100,
    completedTasks: 15,
    totalTasks: 15,
    color: "bg-yellow-500",
    status: "completed",
    priority: "medium",
    deadline: "مكتمل",
    members: [
      { initials: "MA", name: "محمد علي" },
      { initials: "FH", name: "فاطمة حسن" }
    ]
  },
  {
    id: "PRJ-005",
    name: "تحليل البيانات والإحصائيات",
    description: "تحليل بيانات العملاء وتقديم تقارير مفصلة",
    progress: 30,
    completedTasks: 6,
    totalTasks: 20,
    color: "bg-red-500",
    status: "paused",
    priority: "low",
    deadline: "20 يوم متبقي",
    members: [
      { initials: "AM", name: "أحمد محمد" },
      { initials: "SA", name: "سارة أحمد" }
    ]
  },
  {
    id: "PRJ-006",
    name: "تطوير واجهة برمجة التطبيقات",
    description: "إنشاء API متكامل للتفاعل مع التطبيقات الخارجية",
    progress: 60,
    completedTasks: 12,
    totalTasks: 20,
    color: "bg-indigo-500",
    status: "active",
    priority: "high",
    deadline: "12 يوم متبقي",
    members: [
      { initials: "MA", name: "محمد علي" },
      { initials: "FH", name: "فاطمة حسن" }
    ]
  }
];