import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, User, FileText, Shield, Settings, ChevronDown, Search, Filter, MoreVertical, Edit, Trash2, Eye, Plus, Users, Key, Lock, Database, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DraftStorage } from "@/lib/storage";
import { format } from "date-fns";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { PasswordChangeDialog } from "@/components/security/password-change-dialog";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";

const users = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员", status: "活跃", lastLogin: "2024-01-15 14:30" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "编辑", status: "活跃", lastLogin: "2024-01-15 10:20" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "用户", status: "离线", lastLogin: "2024-01-14 16:45" },
];

const roles = [
  { id: 1, name: "超级管理员", permissions: 15, users: 1, description: "拥有所有权限" },
  { id: 2, name: "管理员", permissions: 12, users: 2, description: "拥有大部分管理权限" },
  { id: 3, name: "编辑", permissions: 8, users: 5, description: "可以编辑内容" },
  { id: 4, name: "用户", permissions: 3, users: 128, description: "基础用户权限" },
];

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [drafts, setDrafts] = useState(() => DraftStorage.getAllDrafts());
  const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification } = useNotifications();
  const [currentUser, setCurrentUser] = useState({
    name: "系统管理员",
    email: "admin@example.com",
    phone: "+86 138****8888",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    role: "超级管理员"
  });

  // 处理URL参数来切换tab
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    console.log('URL tab参数:', tab); // 添加调试信息
    if (tab && ['notifications', 'profile', 'drafts', 'permissions', 'api-keys', 'settings'].includes(tab)) {
      setActiveTab(tab);
      console.log('设置activeTab为:', tab); // 添加调试信息
    }
  }, [location.search]);

  // 刷新草稿列表
  const refreshDrafts = () => {
    setDrafts(DraftStorage.getAllDrafts());
  };

  // 删除草稿
  const handleDeleteDraft = (draftId: string) => {
    if (DraftStorage.deleteDraft(draftId)) {
      refreshDrafts();
    }
  };

  // 编辑草稿
  const handleEditDraft = (draftId: string) => {
    navigate(`/apply?draftId=${draftId}`);
  };

  // 处理头像更换
  const handleAvatarChange = (newAvatar: string) => {
    setCurrentUser(prev => ({ ...prev, avatar: newAvatar }));
    // 这里可以调用API保存到服务器
  };

  // 处理个人信息保存
  const handleProfileSave = () => {
    toast({
      title: "保存成功",
      description: "个人信息已更新",
    });
  };

  // 通知管理函数
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "操作成功",
      description: "所有通知已标记为已读",
    });
  };

  const handleMarkAsRead = (id: number) => {
    markAsRead(id);
  };

  const handleDeleteNotification = (id: number) => {
    deleteNotification(id);
    toast({
      title: "删除成功",
      description: "通知已删除",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-heading mb-2">管理面板</h1>
          <p className="text-muted-foreground">系统管理和配置中心</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // 更新URL参数
          const url = new URL(window.location.href);
          url.searchParams.set('tab', value);
          window.history.pushState({}, '', url.toString());
        }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              消息通知
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              个人中心
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              我的草稿
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              权限管理
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API密钥管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              系统设置
            </TabsTrigger>
          </TabsList>

          {/* 消息通知 */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">消息通知</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount} 条未读
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    全部已读
                  </Button>
                )}
                <Input 
                  placeholder="搜索通知..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {notifications
                .filter(notification => 
                  !searchTerm || 
                  notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  notification.message.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((notification) => (
                <Card key={notification.id} className={`transition-all group ${!notification.read ? 'border-primary/50 bg-primary-light/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-muted'}`} />
                        <div>
                          <h3 className="font-medium">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!notification.read && (
                            <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                              标记为已读
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notifications.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">暂无通知</h3>
                    <p className="text-muted-foreground">您的通知将显示在这里</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 个人中心 */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>个人信息</CardTitle>
                  <CardDescription>管理您的个人资料</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AvatarUpload
                    currentAvatar={currentUser.avatar}
                    userName={currentUser.name}
                    onAvatarChange={handleAvatarChange}
                  />
                  <div>
                    <h3 className="font-medium">{currentUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    <Badge variant="secondary" className="mt-1">{currentUser.role}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" value={currentUser.name} onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input id="email" value={currentUser.email} onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <Input id="phone" value={currentUser.phone} onChange={(e) => setCurrentUser(prev => ({ ...prev, phone: e.target.value }))} />
                  </div>
                  <Button onClick={handleProfileSave}>保存更改</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>安全设置</CardTitle>
                  <CardDescription>保护您的账户安全</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">两步验证</p>
                      <p className="text-sm text-muted-foreground">增强账户安全性</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">登录通知</p>
                      <p className="text-sm text-muted-foreground">新设备登录时通知</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <PasswordChangeDialog>
                    <Button variant="outline" className="w-full">修改密码</Button>
                  </PasswordChangeDialog>
                  <Button variant="outline" className="w-full">查看登录记录</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 我的草稿 */}
          <TabsContent value="drafts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">我的草稿</h2>
              <Button onClick={() => navigate('/apply')}>
                <Plus className="h-4 w-4 mr-2" />
                新建草稿
              </Button>
            </div>

            <div className="grid gap-4">
              {drafts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">暂无草稿</h3>
                    <p className="text-muted-foreground mb-4">您还没有保存任何算法申请草稿</p>
                    <Button onClick={() => navigate('/apply')}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建新申请
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                drafts.map((draft) => (
                  <Card key={draft.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{draft.name || '未命名算法'}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline">{draft.category || '未分类'}</Badge>
                            <span className="text-sm text-muted-foreground">
                              最后修改: {format(new Date(draft.updatedAt), "yyyy-MM-dd HH:mm")}
                            </span>
                            <Badge variant="secondary">草稿</Badge>
                          </div>
                          {draft.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {draft.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditDraft(draft.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDraft(draft.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* 权限管理 */}
          <TabsContent value="permissions" className="space-y-6">
            <Tabs defaultValue="users" className="space-y-4">
              <TabsList>
                <TabsTrigger value="users">用户管理</TabsTrigger>
                <TabsTrigger value="roles">角色权限</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">用户管理</h3>
                  <div className="flex items-center gap-2">
                    <Input placeholder="搜索用户..." className="w-64" />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          添加用户
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>添加新用户</DialogTitle>
                          <DialogDescription>
                            填写用户信息并分配角色
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-username">用户名</Label>
                            <Input id="new-username" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-email">邮箱</Label>
                            <Input id="new-email" type="email" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-role">角色</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="选择角色" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">管理员</SelectItem>
                                <SelectItem value="editor">编辑</SelectItem>
                                <SelectItem value="user">用户</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button className="w-full">创建用户</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-4">用户</th>
                            <th className="text-left p-4">角色</th>
                            <th className="text-left p-4">状态</th>
                            <th className="text-left p-4">最后登录</th>
                            <th className="text-left p-4">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant={user.role === "管理员" ? "default" : "secondary"}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={user.status === "活跃" ? "default" : "secondary"}>
                                  {user.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{user.lastLogin}</td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>编辑</DropdownMenuItem>
                                    <DropdownMenuItem>重置密码</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">删除</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">角色权限</h3>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加角色
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {roles.map((role) => (
                    <Card key={role.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>编辑权限</DropdownMenuItem>
                              <DropdownMenuItem>复制角色</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">删除角色</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <CardDescription>{role.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            <span>{role.permissions} 项权限</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{role.users} 个用户</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* API密钥管理 */}
          <TabsContent value="api-keys" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">API密钥管理</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建新密钥
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>创建API密钥</DialogTitle>
                    <DialogDescription>
                      为应用或用户创建新的API访问密钥
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>密钥名称</Label>
                      <Input placeholder="例如：生产环境密钥" />
                    </div>
                    <div>
                      <Label>权限范围</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择权限范围" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="read">只读权限</SelectItem>
                          <SelectItem value="write">读写权限</SelectItem>
                          <SelectItem value="admin">管理员权限</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>到期时间</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="选择到期时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30d">30天</SelectItem>
                          <SelectItem value="90d">90天</SelectItem>
                          <SelectItem value="1y">1年</SelectItem>
                          <SelectItem value="never">永不过期</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>备注</Label>
                      <Textarea placeholder="密钥用途说明..." />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Close dialog logic would go here
                          toast({
                            title: "已取消",
                            description: "已取消创建API密钥",
                          });
                        }}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={() => {
                          // Create API key logic would go here
                          toast({
                            title: "创建成功",
                            description: "API密钥已创建，请妥善保管",
                          });
                        }}
                      >
                        创建密钥
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>API密钥列表</span>
                    <Badge variant="secondary">3个有效密钥</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: '生产环境密钥', key: 'pk_live_1234567890abcdef', status: '活跃', expires: '2025-06-15', lastUsed: '2小时前' },
                    { name: '测试环境密钥', key: 'pk_test_abcdef1234567890', status: '活跃', expires: '2025-03-20', lastUsed: '1天前' },
                    { name: '开发环境密钥', key: 'pk_dev_1234567890abcdef', status: '已停用', expires: '2025-12-31', lastUsed: '7天前' }
                  ].map((apiKey, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={apiKey.status === '活跃' ? 'default' : 'secondary'}>
                              {apiKey.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              到期：{apiKey.expires}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              最后使用：{apiKey.lastUsed}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                toast({
                                  title: "查看详情",
                                  description: `查看 ${apiKey.name} 的详细信息`,
                                });
                              }}
                            >
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                toast({
                                  title: "重新生成",
                                  description: `${apiKey.name} 密钥已重新生成`,
                                });
                              }}
                            >
                              重新生成
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                toast({
                                  title: "删除成功",
                                  description: `${apiKey.name} 已删除`,
                                  variant: "destructive",
                                });
                              }}
                            >
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="bg-muted rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono">{apiKey.key}****</code>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(apiKey.key);
                              toast({
                                title: "已复制",
                                description: "API密钥已复制到剪贴板",
                              });
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <div className="grid grid-cols-2 gap-4">
                          <div>权限：读写权限</div>
                          <div>创建时间：{new Date().toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>使用统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-primary">1,234</div>
                      <div className="text-sm text-muted-foreground">今日调用次数</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-success">99.9%</div>
                      <div className="text-sm text-muted-foreground">成功率</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-warning">45ms</div>
                      <div className="text-sm text-muted-foreground">平均响应时间</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>基础设置</CardTitle>
                  <CardDescription>系统基本配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">站点名称</Label>
                    <Input id="site-name" defaultValue="AI算法平台" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-desc">站点描述</Label>
                    <Textarea id="site-desc" defaultValue="专业的AI算法分享与交流平台" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">维护模式</p>
                      <p className="text-sm text-muted-foreground">开启后用户无法访问</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">用户注册</p>
                      <p className="text-sm text-muted-foreground">允许新用户注册</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>安全设置</CardTitle>
                  <CardDescription>系统安全配置</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">强制HTTPS</p>
                      <p className="text-sm text-muted-foreground">重定向HTTP到HTTPS</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API访问限制</p>
                      <p className="text-sm text-muted-foreground">限制API请求频率</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">会话超时 (分钟)</Label>
                    <Input id="session-timeout" type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-policy">密码策略</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">低 (6位数字字母)</SelectItem>
                        <SelectItem value="medium">中 (8位包含特殊字符)</SelectItem>
                        <SelectItem value="high">高 (12位复杂密码)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>数据备份</CardTitle>
                  <CardDescription>系统数据备份管理</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">自动备份</p>
                      <p className="text-sm text-muted-foreground">定期自动备份数据</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-interval">备份间隔</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">每小时</SelectItem>
                        <SelectItem value="daily">每天</SelectItem>
                        <SelectItem value="weekly">每周</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Database className="h-4 w-4 mr-2" />
                      立即备份
                    </Button>
                    <Button variant="outline" className="flex-1">恢复数据</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>系统监控</CardTitle>
                  <CardDescription>系统运行状态监控</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">CPU使用率</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">内存使用率</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div className="bg-warning h-2 rounded-full" style={{ width: '67%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">磁盘使用率</span>
                      <span className="text-sm font-medium">23%</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full">
                      <div className="bg-success h-2 rounded-full" style={{ width: '23%' }} />
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">查看详细监控</Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline">重置设置</Button>
              <Button>保存所有设置</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}