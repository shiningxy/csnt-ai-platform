import React, { createContext, useContext, useMemo, useState } from "react";

export type AppUserRole = 'algorithm_engineer' | 'team_lead' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  role: AppUserRole;
  email: string;
  avatar: string;
  phone?: string;
}

interface UserContextValue {
  user: AppUser;
  updateUser: (updates: Partial<AppUser>) => void;
  updateAvatar: (avatar: string) => void;
}

const defaultUser: AppUser = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: '张三',
  role: 'admin',
  email: 'zhangsan@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
  phone: '+86 138****8888',
};

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(() => {
    try {
      const cached = localStorage.getItem('app:user');
      return cached ? JSON.parse(cached) as AppUser : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const updateUser = (updates: Partial<AppUser>) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app:user', JSON.stringify(next));
      return next;
    });
  };

  const updateAvatar = (avatar: string) => updateUser({ avatar });

  const value = useMemo(() => ({ user, updateUser, updateAvatar }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within <UserProvider>');
  return ctx;
}
