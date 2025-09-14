import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  role: 'algorithm_engineer' | 'team_lead' | 'admin';
  email: string;
  avatar: string;
}

// Mock user for now - in a real app, this would come from authentication
const mockUser: User = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: '张三',
  role: 'admin',
  email: 'zhangsan@company.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
};

export const useUser = () => {
  const [user, setUser] = useState<User>(mockUser);
  const [loading, setLoading] = useState(false);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateAvatar = (newAvatar: string) => {
    setUser(prev => ({ ...prev, avatar: newAvatar }));
  };

  return {
    user,
    loading,
    updateUser,
    updateAvatar
  };
};