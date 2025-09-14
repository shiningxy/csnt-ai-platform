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
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationManager } from '@/components/notifications/notification-manager';
import { useNotifications } from '@/hooks/use-notifications';

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

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification } = useNotifications();

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(currentUser.role)
  );

  // 通知管理函数
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleDeleteNotification = (id: number) => {
    deleteNotification(id);
  };

  const handleUserMenuClick = (action: string) => {
    console.log('点击菜单项:', action); // 添加调试信息
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
            {/* Theme Toggle */}
            <ThemeToggle />

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
              <PopoverContent className="p-0" align="end" sideOffset={10}>
                <NotificationManager
                  notifications={notifications}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                  onClose={() => setNotificationOpen(false)}
                />
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
              <DropdownMenuContent className="w-56 z-50 bg-popover border shadow-lg" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUserMenuClick('profile');
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  个人中心
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUserMenuClick('drafts');
                  }}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  我的草稿
                </DropdownMenuItem>
                {currentUser.role === 'admin' && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUserMenuClick('permissions');
                    }}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    权限管理
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUserMenuClick('settings');
                  }}
                >
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