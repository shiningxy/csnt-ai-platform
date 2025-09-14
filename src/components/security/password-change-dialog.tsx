import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PasswordChangeDialogProps {
  children: React.ReactNode;
}

export function PasswordChangeDialog({ children }: PasswordChangeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validatePassword = (password: string): string[] => {
    const errors = [];
    if (password.length < 8) {
      errors.push('密码长度至少8位');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('至少包含一个大写字母');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('至少包含一个小写字母');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('至少包含一个数字');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('至少包含一个特殊字符');
    }
    return errors;
  };

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    // 实时验证新密码
    if (field === 'new') {
      const validationErrors = validatePassword(value);
      setErrors(validationErrors);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    // 验证表单
    const validationErrors = [];
    
    if (!passwords.current) {
      validationErrors.push('请输入当前密码');
    }
    
    if (!passwords.new) {
      validationErrors.push('请输入新密码');
    } else {
      validationErrors.push(...validatePassword(passwords.new));
    }
    
    if (passwords.new !== passwords.confirm) {
      validationErrors.push('两次输入的新密码不一致');
    }
    
    if (passwords.current === passwords.new) {
      validationErrors.push('新密码不能与当前密码相同');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      // 模拟API调用
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // 模拟验证当前密码
          if (passwords.current !== 'demo123') {
            reject(new Error('当前密码不正确'));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      // 成功
      toast({
        title: '密码修改成功',
        description: '您的密码已成功更新，请使用新密码登录',
      });

      // 重置表单
      setPasswords({ current: '', new: '', confirm: '' });
      setIsOpen(false);

    } catch (error: any) {
      setErrors([error.message || '密码修改失败，请重试']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' });
    setErrors([]);
    setIsOpen(false);
  };

  const passwordStrength = passwords.new.length > 0 ? Math.min(validatePassword(passwords.new).length, 5) : 0;
  const strengthLevel = passwordStrength === 0 ? '强' : passwordStrength <= 2 ? '中' : '弱';
  const strengthColor = passwordStrength === 0 ? 'text-success' : passwordStrength <= 2 ? 'text-warning' : 'text-danger';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            修改密码
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 当前密码 */}
          <div className="space-y-2">
            <Label htmlFor="current-password">当前密码</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => handlePasswordChange('current', e.target.value)}
                placeholder="请输入当前密码"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
                disabled={isLoading}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* 新密码 */}
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                placeholder="请输入新密码"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
                disabled={isLoading}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {/* 密码强度指示器 */}
            {passwords.new && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        passwordStrength === 0 ? 'bg-success w-full' : 
                        passwordStrength <= 2 ? 'bg-warning w-2/3' : 
                        'bg-danger w-1/3'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strengthColor}`}>
                    {strengthLevel}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  密码应包含大小写字母、数字和特殊字符，至少8位
                </p>
              </div>
            )}
          </div>

          {/* 确认新密码 */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认新密码</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                placeholder="请再次输入新密码"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={isLoading}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {/* 密码匹配提示 */}
            {passwords.confirm && (
              <div className="flex items-center gap-1 text-xs">
                {passwords.new === passwords.confirm ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-success" />
                    <span className="text-success">密码匹配</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-danger" />
                    <span className="text-danger">密码不匹配</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* 安全提示 */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              修改密码后，您需要重新登录。请确保记住新密码。
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || errors.length > 0}>
            {isLoading ? '修改中...' : '确认修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}