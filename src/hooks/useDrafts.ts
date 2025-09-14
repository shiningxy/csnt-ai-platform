import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Draft {
  id: string;
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export const useDrafts = (userId?: string) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (draftId: string) => {
    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (err) {
      console.error('Failed to delete draft:', err);
    }
  };

  const saveDraft = async (name: string, data: any) => {
    if (!userId) return null;
    
    try {
      const { data: result, error } = await supabase
        .from('drafts')
        .insert({
          user_id: userId,
          name,
          data
        })
        .select()
        .single();

      if (error) throw error;
      
      setDrafts(prev => [result, ...prev]);
      return result;
    } catch (err) {
      console.error('Failed to save draft:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [userId]);

  return { 
    drafts, 
    loading, 
    error, 
    deleteDraft, 
    saveDraft,
    refetch: fetchDrafts 
  };
};