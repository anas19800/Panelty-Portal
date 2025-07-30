'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  MessageSquare,
  Bell
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'الرئيسية',
      href: '/',
      icon: Home,
      current: pathname === '/'
    },
    {
      name: 'المشاريع',
      href: '/projects',
      icon: FolderOpen,
      current: pathname === '/projects'
    },
    {
      name: 'المهام',
      href: '/tasks',
      icon: CheckSquare,
      current: pathname === '/tasks'
    },
    {
      name: 'الفريق',
      href: '/team',
      icon: Users,
      current: pathname === '/team'
    },
    {
      name: 'التقارير',
      href: '/reports',
      icon: BarChart3,
      current: pathname === '/reports'
    },
    {
      name: 'التقويم',
      href: '/calendar',
      icon: Calendar,
      current: pathname === '/calendar'
    },
    {
      name: 'المستندات',
      href: '/documents',
      icon: FileText,
      current: pathname === '/documents'
    },
    {
      name: 'الرسائل',
      href: '/messages',
      icon: MessageSquare,
      current: pathname === '/messages'
    }
  ];

  const quickActions = [
    {
      name: 'مشروع جديد',
      href: '/projects/new',
      icon: Plus
    },
    {
      name: 'مهمة جديدة',
      href: '/tasks/new',
      icon: Plus
    },
    {
      name: 'إضافة عضو',
      href: '/team/new',
      icon: Plus
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-lg font-bold text-gray-900">SmartSheet</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                إجراءات سريعة
              </h3>
              <div className="space-y-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.name}
                      href={action.href}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span>{action.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="space-y-2">
              <Link
                href="/settings"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>الإعدادات</span>
              </Link>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">JD</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">أحمد محمد</p>
                    <p className="text-xs text-gray-500">مدير المشروع</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}