'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Eye
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك في SmartSheet</h1>
          <p className="text-gray-600">إدارة مشاريعك ومهامك بسهولة وفعالية</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المشاريع</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+12% من الشهر الماضي</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المهام النشطة</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+8% من الأسبوع الماضي</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أعضاء الفريق</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 عضو جديد</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">+5% من الشهر الماضي</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">المشاريع الحديثة</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              مشروع جديد
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                      <CardTitle className="text-sm">{project.name}</CardTitle>
                    </div>
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </div>
                  <CardDescription className="text-xs">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>التقدم</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.members.map((member, memberIndex) => (
                          <Avatar key={memberIndex} className="h-6 w-6 border-2 border-white">
                            <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status === 'active' ? 'نشط' : 'معلق'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {project.deadline}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">المهام العاجلة</h2>
            <Button variant="outline" size="sm">عرض الكل</Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {recentTasks.map((task, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-gray-500">{task.project}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {task.dueDate}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                          </Avatar>
                          
                          {task.priority === 'high' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">نشاط الفريق</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">أعضاء الفريق النشطين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{member.tasks} مهام</p>
                        <p className="text-xs text-gray-500">{member.completion}% إنجاز</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">المشاريع المفضلة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favoriteProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                        <div>
                          <p className="text-sm font-medium">{project.name}</p>
                          <p className="text-xs text-gray-500">{project.tasks} مهام</p>
                        </div>
                      </div>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

const recentProjects = [
  {
    name: "تطوير تطبيق الموبايل",
    description: "تطوير تطبيق iOS و Android للعملاء",
    progress: 75,
    color: "bg-blue-500",
    status: "active",
    deadline: "15 يوم متبقي",
    members: [
      { initials: "JD" },
      { initials: "SM" },
      { initials: "AK" }
    ]
  },
  {
    name: "إعادة تصميم الموقع",
    description: "تحديث واجهة المستخدم وتحسين الأداء",
    progress: 45,
    color: "bg-green-500",
    status: "active",
    deadline: "8 أيام متبقي",
    members: [
      { initials: "JD" },
      { initials: "LM" }
    ]
  },
  {
    name: "حملة التسويق الرقمي",
    description: "إطلاق حملة تسويقية شاملة",
    progress: 90,
    color: "bg-purple-500",
    status: "active",
    deadline: "3 أيام متبقي",
    members: [
      { initials: "JD" },
      { initials: "SM" },
      { initials: "AK" },
      { initials: "LM" }
    ]
  }
];

const recentTasks = [
  {
    title: "مراجعة تصميم الواجهة",
    project: "تطوير تطبيق الموبايل",
    priority: "high",
    dueDate: "اليوم",
    assignee: { initials: "JD" }
  },
  {
    title: "إعداد قاعدة البيانات",
    project: "إعادة تصميم الموقع",
    priority: "medium",
    dueDate: "غداً",
    assignee: { initials: "SM" }
  },
  {
    title: "كتابة المحتوى التسويقي",
    project: "حملة التسويق الرقمي",
    priority: "low",
    dueDate: "بعد غد",
    assignee: { initials: "AK" }
  }
];

const teamMembers = [
  {
    name: "أحمد محمد",
    role: "مدير المشروع",
    initials: "AM",
    tasks: 12,
    completion: 85
  },
  {
    name: "سارة أحمد",
    role: "مطور واجهة",
    initials: "SA",
    tasks: 8,
    completion: 92
  },
  {
    name: "محمد علي",
    role: "مطور خلفية",
    initials: "MA",
    tasks: 15,
    completion: 78
  },
  {
    name: "فاطمة حسن",
    role: "مصمم جرافيك",
    initials: "FH",
    tasks: 6,
    completion: 95
  }
];

const favoriteProjects = [
  {
    name: "تطوير تطبيق الموبايل",
    color: "bg-blue-500",
    tasks: 24
  },
  {
    name: "إعادة تصميم الموقع",
    color: "bg-green-500",
    tasks: 18
  },
  {
    name: "حملة التسويق الرقمي",
    color: "bg-purple-500",
    tasks: 12
  }
];
