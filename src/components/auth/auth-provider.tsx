import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'algorithm_engineer' | 'team_lead' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取用户档案
  const fetchProfile = async (userId: string, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // 如果是权限问题或用户不存在，不要重试
        if (error.code === 'PGRST116' || error.message.includes('permission')) {
          return;
        }
        // 对于其他错误，重试
        if (retries > 0) {
          setTimeout(() => fetchProfile(userId, retries - 1), 1000);
          return;
        }
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (retries > 0) {
        setTimeout(() => fetchProfile(userId, retries - 1), 1000);
      }
    }
  };

  // 创建用户档案
  const createProfile = async (user: User, retries = 3) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '用户',
          email: user.email!,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          role: 'algorithm_engineer' // 默认角色
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // 如果是唯一约束违反（用户已存在），尝试获取现有档案
        if (error.code === '23505') {
          setTimeout(() => fetchProfile(user.id), 500);
          return;
        }
        // 对于其他错误，重试
        if (retries > 0) {
          setTimeout(() => createProfile(user, retries - 1), 1000);
          return;
        }
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      if (retries > 0) {
        setTimeout(() => createProfile(user, retries - 1), 1000);
      }
    }
  };

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // 用户登录，获取或创建档案
          setTimeout(async () => {
            try {
              const { data: existingProfile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

              if (existingProfile) {
                setProfile(existingProfile as Profile);
              } else if (error?.code === 'PGRST116') {
                // 用户档案不存在，创建新档案
                await createProfile(session.user);
              } else if (error) {
                console.error('Profile fetch error:', error);
                // 如果获取失败但不是因为不存在，稍后重试
                setTimeout(() => fetchProfile(session.user.id), 2000);
              }
            } catch (error) {
              console.error('Profile operation error:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          // 用户登出
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // 检查现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}