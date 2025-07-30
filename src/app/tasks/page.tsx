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
  CheckCircle,
  Circle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'في الانتظار';
      default:
        return 'ملغي';
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
              <h1 className="text-3xl font-bold text-gray-900">المهام</h1>
              <p className="text-gray-600">إدارة جميع مهامك ومتابعة تقدمها</p>
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
                مهمة جديدة
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
                    placeholder="البحث في المهام..."
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
                  <option value="completed">مكتمل</option>
                  <option value="in_progress">قيد التنفيذ</option>
                  <option value="pending">في الانتظار</option>
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">جميع الأولويات</option>
                  <option value="high">عالية</option>
                  <option value="medium">متوسطة</option>
                  <option value="low">منخفضة</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>قائمة المهام</CardTitle>
                <CardDescription>
                  {filteredTasks.length} مهمة من أصل {tasks.length}
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
                  <TableHead>المهمة</TableHead>
                  <TableHead>المشروع</TableHead>
                  <TableHead>المسؤول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>تاريخ الإنتهاء</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          {task.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${task.projectColor}`}></div>
                        <span className="text-sm">{task.project}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{task.assignee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <Badge 
                          variant={
                            task.status === 'completed' ? 'default' : 
                            task.status === 'in_progress' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm">
                          {task.priority === 'high' ? 'عالية' : 
                           task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{task.dueDate}</span>
                        {task.isOverdue && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{task.progress}%</span>
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
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            تعديل المهمة
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            إكمال المهمة
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف المهمة
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
              <CardTitle className="text-sm font-medium">إجمالي المهام</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">+5 مهام جديدة هذا الأسبوع</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">مهام منجزة</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام العاجلة</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">مهام عالية الأولوية</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length)}%
              </div>
              <p className="text-xs text-muted-foreground">متوسط التقدم العام</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

const tasks = [
  {
    id: "TASK-001",
    title: "مراجعة تصميم الواجهة",
    description: "مراجعة وتحديث تصميم واجهة المستخدم للتطبيق الجديد",
    project: "تطوير تطبيق الموبايل",
    projectColor: "bg-blue-500",
    status: "in_progress",
    priority: "high",
    progress: 75,
    dueDate: "اليوم",
    isOverdue: false,
    assignee: { initials: "AM", name: "أحمد محمد" }
  },
  {
    id: "TASK-002",
    title: "إعداد قاعدة البيانات",
    description: "إنشاء وتكوين قاعدة البيانات للمشروع الجديد",
    project: "إعادة تصميم الموقع",
    projectColor: "bg-green-500",
    status: "pending",
    priority: "medium",
    progress: 0,
    dueDate: "غداً",
    isOverdue: false,
    assignee: { initials: "SA", name: "سارة أحمد" }
  },
  {
    id: "TASK-003",
    title: "كتابة المحتوى التسويقي",
    description: "كتابة محتوى تسويقي للحملة الجديدة",
    project: "حملة التسويق الرقمي",
    projectColor: "bg-purple-500",
    status: "completed",
    priority: "low",
    progress: 100,
    dueDate: "أمس",
    isOverdue: false,
    assignee: { initials: "AK", name: "أحمد كريم" }
  },
  {
    id: "TASK-004",
    title: "اختبار الوظائف الجديدة",
    description: "اختبار جميع الوظائف الجديدة والتأكد من عملها بشكل صحيح",
    project: "تطوير تطبيق الموبايل",
    projectColor: "bg-blue-500",
    status: "in_progress",
    priority: "high",
    progress: 45,
    dueDate: "بعد غد",
    isOverdue: false,
    assignee: { initials: "MA", name: "محمد علي" }
  },
  {
    id: "TASK-005",
    title: "تحسين الأداء",
    description: "تحسين أداء الموقع وزيادة سرعة التحميل",
    project: "إعادة تصميم الموقع",
    projectColor: "bg-green-500",
    status: "pending",
    priority: "medium",
    progress: 0,
    dueDate: "الأسبوع القادم",
    isOverdue: false,
    assignee: { initials: "FH", name: "فاطمة حسن" }
  },
  {
    id: "TASK-006",
    title: "إعداد التقارير الشهرية",
    description: "إعداد التقارير الشهرية للمبيعات والأداء",
    project: "تحليل البيانات والإحصائيات",
    projectColor: "bg-red-500",
    status: "in_progress",
    priority: "high",
    progress: 60,
    dueDate: "أمس",
    isOverdue: true,
    assignee: { initials: "AM", name: "أحمد محمد" }
  },
  {
    id: "TASK-007",
    title: "تحديث التوثيق",
    description: "تحديث التوثيق التقني للمشروع",
    project: "تطوير واجهة برمجة التطبيقات",
    projectColor: "bg-indigo-500",
    status: "completed",
    priority: "low",
    progress: 100,
    dueDate: "قبل أسبوع",
    isOverdue: false,
    assignee: { initials: "SA", name: "سارة أحمد" }
  },
  {
    id: "TASK-008",
    title: "إعداد الاجتماع الأسبوعي",
    description: "إعداد جدول أعمال الاجتماع الأسبوعي للفريق",
    project: "إدارة الفريق",
    projectColor: "bg-yellow-500",
    status: "pending",
    priority: "medium",
    progress: 0,
    dueDate: "اليوم",
    isOverdue: false,
    assignee: { initials: "MA", name: "محمد علي" }
  }
];