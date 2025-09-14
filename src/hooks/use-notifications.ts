import { useState, useCallback, useEffect } from 'react';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Global notifications state
const initialNotifications: Notification[] = [
  { id: 1, type: 'system', title: '系统维护通知', message: '系统将于今晚22:00-24:00进行维护', time: '10分钟前', read: false },
  { id: 2, type: 'algorithm', title: '新算法待审核', message: '用户张三提交了新的排序算法', time: '1小时前', read: false },
  { id: 3, type: 'user', title: '用户注册', message: '新用户李四已注册', time: '2小时前', read: true },
  { id: 4, type: 'security', title: '安全警告', message: '检测到异常登录行为', time: '3小时前', read: false },
];

let globalNotifications = initialNotifications;
const listeners: Set<() => void> = new Set();

export function useNotifications() {
  const [notifications, setNotifications] = useState(globalNotifications);

  const updateGlobalState = useCallback((newNotifications: Notification[]) => {
    globalNotifications = newNotifications;
    // Notify all listeners
    listeners.forEach(listener => listener());
  }, []);

  const markAllAsRead = useCallback(() => {
    const updated = globalNotifications.map(n => ({ ...n, read: true }));
    updateGlobalState(updated);
    setNotifications(updated);
  }, [updateGlobalState]);

  const markAsRead = useCallback((id: number) => {
    const updated = globalNotifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    updateGlobalState(updated);
    setNotifications(updated);
  }, [updateGlobalState]);

  const deleteNotification = useCallback((id: number) => {
    const updated = globalNotifications.filter(n => n.id !== id);
    updateGlobalState(updated);
    setNotifications(updated);
  }, [updateGlobalState]);

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => {
      setNotifications([...globalNotifications]);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
  };
}