import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StatsData {
  totalAlgorithms: number;
  onlineAlgorithms: number;
  developingAlgorithms: number;
  totalCalls: number;
}

export const useStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalAlgorithms: 0,
    onlineAlgorithms: 0,
    developingAlgorithms: 0,
    totalCalls: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get algorithm counts
      const { data: algorithms, error: algError } = await supabase
        .from('algorithms')
        .select('status, call_count');

      if (algError) throw algError;

      const totalAlgorithms = algorithms?.length || 0;
      const onlineAlgorithms = algorithms?.filter(a => a.status === 'approved').length || 0;
      const developingAlgorithms = totalAlgorithms - onlineAlgorithms;
      const totalCalls = algorithms?.reduce((sum, a) => sum + (a.call_count || 0), 0) || 0;

      setStats({
        totalAlgorithms,
        onlineAlgorithms,
        developingAlgorithms,
        totalCalls
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};