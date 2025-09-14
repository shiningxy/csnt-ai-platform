import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';

interface AvatarUploadProps {
  currentAvatar: string;
  userName: string;
  onAvatarChange: (newAvatar: string) => void;
}

// 预设头像选项
const presetAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jack',
];

export function AvatarUpload({ currentAvatar, userName, onAvatarChange }: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateAvatar } = useUser();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast({
          title: '文件格式不支持',
          description: '请选择图片文件',
          variant: 'destructive',
        });
        return;
      }

      // 检查文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件太大',
          description: '图片大小不能超过5MB',
          variant: 'destructive',
        });
        return;
      }

      // 创建预览URL
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const handleSave = () => {
    onAvatarChange(selectedAvatar);
    updateAvatar(selectedAvatar); // Sync with global user state
    setIsOpen(false);
    toast({
      title: '头像更新成功',
      description: '您的头像已更新',
    });
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentAvatar} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="space-y-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Camera className="h-4 w-4 mr-2" />
              更换头像
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>更换头像</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* 当前选择预览 */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedAvatar} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">预览</p>
                  <p className="text-sm text-muted-foreground">这将是您的新头像</p>
                </div>
              </div>

              {/* 上传文件 */}
              <div className="space-y-3">
                <h4 className="font-medium">上传自定义头像</h4>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    点击上传或拖拽图片到这里
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    支持 JPG、PNG、GIF，最大 5MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    选择文件
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 预设头像 */}
              <div className="space-y-3">
                <h4 className="font-medium">选择预设头像</h4>
                <div className="grid grid-cols-6 gap-3">
                  {presetAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handlePresetSelect(avatar)}
                      className={`relative rounded-full transition-all ${
                        selectedAvatar === avatar
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:scale-105'
                      }`}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={avatar} />
                        <AvatarFallback><User className="h-6 w-6" /></AvatarFallback>
                      </Avatar>
                      {selectedAvatar === avatar && (
                        <Badge 
                          variant="default" 
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          ✓
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  保存更改
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <p className="text-xs text-muted-foreground">
          支持 JPG、PNG、GIF 格式，最大 5MB
        </p>
      </div>
    </div>
  );
}