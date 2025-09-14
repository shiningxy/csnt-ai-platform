import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, CheckCheck } from 'lucide-react';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationManagerProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export function NotificationManager({ 
  notifications, 
  onMarkAllAsRead, 
  onMarkAsRead, 
  onDelete,
  onClose 
}: NotificationManagerProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="w-80 p-0">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">通知</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs px-2 py-1 h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              全部已读
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            暂无通知
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="border-b last:border-b-0">
              <div className="p-3 hover:bg-accent transition-colors group">
                <div className="flex items-start gap-3">
                  <div 
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !notification.read ? 'bg-primary' : 'bg-muted'
                    }`} 
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium line-clamp-1">{notification.title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(notification.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 h-6 w-6 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs px-2 py-0 h-5 hover:bg-primary/10"
                        >
                          标为已读
                        </Button>
                      )}
                    </div>
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
            onClick={() => {/* 导航到通知页面 */}}
          >
            查看全部通知
          </Button>
        </div>
      )}
    </div>
  );
}