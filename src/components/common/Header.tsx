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
import { Bell, User, FileText, Shield, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NotificationManager } from '@/components/notifications/notification-manager';
import { useNotifications } from '@/hooks/use-notifications';
import { useHeaderTheme } from '@/hooks/use-header-theme';
import { useAuth } from '@/components/auth/auth-provider';

// Navigation items configuration
const navigationItems = [
  { label: '算法库', href: '/', roles: ['all'] },
  { label: '审批中心', href: '/approval', roles: ['team_lead', 'admin'] },
  { label: '管理面板', href: '/admin', roles: ['admin'] },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification } = useNotifications();
  
  // 使用profile作为当前用户信息
  const currentUser = profile ? {
    id: profile.id,
    name: profile.name,
    role: profile.role,
    email: profile.email,
    avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`
  } : null;
  
  // Get dynamic header theme styles
  const { 
    headerClass, 
    textClass, 
    logoTextClass, 
    subtitleClass, 
    iconClass, 
    buttonClass, 
    activeButtonClass 
  } = useHeaderTheme();

  // 过滤导航项目基于用户角色
  const visibleNavItems = currentUser ? navigationItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(currentUser.role)
  ) : navigationItems.filter(item => item.roles.includes('all'));

  const handleUserMenuClick = async (action: string) => {
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
        await signOut();
        navigate('/auth');
        break;
      default:
        console.log('未知操作:', action);
    }
  };

  const handleNotificationAction = (action: string, notificationId?: number) => {
    switch (action) {
      case 'markAllRead':
        markAllAsRead();
        break;
      case 'markRead':
        if (notificationId !== undefined) markAsRead(notificationId);
        break;
      case 'delete':
        if (notificationId !== undefined) deleteNotification(notificationId);
        break;
    }
  };

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">算</span>
            </div>
            <div className="flex flex-col">
              <span className={cn("font-semibold text-lg leading-none", logoTextClass)}>
                算法管理平台
              </span>
              <span className={cn("text-xs leading-none mt-0.5", subtitleClass)}>
                Algorithm Management
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? activeButtonClass : buttonClass
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications - 只在用户登录时显示 */}
          {currentUser && (
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("relative transition-colors", buttonClass)}>
                  <Bell className={cn("h-4 w-4", iconClass)} />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 z-50" align="end">
                <NotificationManager
                  notifications={notifications}
                  onMarkAllAsRead={() => handleNotificationAction('markAllRead')}
                  onMarkAsRead={(id) => handleNotificationAction('markRead', id)}
                  onDelete={(id) => handleNotificationAction('delete', id)}
                  onClose={() => setNotificationOpen(false)}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* User Menu - 只在用户登录时显示 */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("relative h-9 w-9 rounded-full transition-colors", buttonClass)}>
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
                  系统设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUserMenuClick('logout');
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Login button for non-authenticated users */}
          {!currentUser && (
            <Button 
              onClick={() => navigate('/auth')}
              className={cn("transition-colors", buttonClass)}
            >
              登录
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}