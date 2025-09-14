import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Brain, Bell, Settings, LogOut, User, FileText, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock current user - in real app this would come from auth context
const currentUser = {
  id: '1',
  name: '张三',
  role: 'admin' as const, // Changed to admin to show admin features
  email: 'zhangsan@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
};

const navigationItems = [
  { label: '算法库', href: '/', roles: ['all'] },
  { label: '审批中心', href: '/approval', roles: ['team_lead', 'admin'] },
  { label: '管理面板', href: '/admin', roles: ['admin'] },
];

// Mock notifications data
const mockNotifications = [
  { id: 1, type: 'system', title: '系统维护通知', message: '系统将于今晚22:00-24:00进行维护', time: '10分钟前', read: false },
  { id: 2, type: 'algorithm', title: '新算法待审核', message: '用户张三提交了新的排序算法', time: '1小时前', read: false },
  { id: 3, type: 'user', title: '用户注册', message: '新用户李四已注册', time: '2小时前', read: true },
  { id: 4, type: 'security', title: '安全警告', message: '检测到异常登录行为', time: '3小时前', read: false },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState(mockNotifications);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(currentUser.role)
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleUserMenuClick = (action: string) => {
    switch (action) {
      case 'profile':
        navigate('/admin?tab=profile');
        break;
      case 'drafts':
        navigate('/admin?tab=drafts');
        break;
      case 'permissions':
        navigate('/admin?tab=permissions');
        break;
      case 'settings':
        navigate('/admin?tab=settings');
        break;
      case 'logout':
        // 这里应该实现登出逻辑
        console.log('用户登出');
        break;
      default:
        break;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Platform Name */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">AI赋能平台</h1>
                <p className="text-xs text-muted-foreground">算法资产管理中心</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative",
                    location.pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.label}
                  {item.href === '/approval' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-danger"></span>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end" sideOffset={10}>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold">通知</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotificationOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      暂无通知
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="border-b last:border-b-0">
                        <div className="p-3 hover:bg-accent transition-colors">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-primary' : 'bg-muted'}`} />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.message}</p>
                              <p className="text-xs text-muted-foreground">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 border-t">
                    <Button 
                      variant="ghost" 
                      className="w-full text-xs"
                      onClick={() => navigate('/admin?tab=notifications')}
                    >
                      查看全部通知
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-background border shadow-lg" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleUserMenuClick('profile')}>
                  <User className="mr-2 h-4 w-4" />
                  个人中心
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUserMenuClick('drafts')}>
                  <FileText className="mr-2 h-4 w-4" />
                  我的草稿
                </DropdownMenuItem>
                {currentUser.role === 'admin' && (
                  <DropdownMenuItem onClick={() => handleUserMenuClick('permissions')}>
                    <Shield className="mr-2 h-4 w-4" />
                    权限管理
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleUserMenuClick('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-danger focus:text-danger"
                  onClick={() => handleUserMenuClick('logout')}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}