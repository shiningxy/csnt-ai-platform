import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AlgorithmAsset } from '@/types/algorithm';

interface DatabaseAlgorithm {
  id: string;
  name: string;
  description: string | null;
  status: string;
  call_count: number;
  rating: number | null;
  popularity: number;
  applicable_scenarios: string | null;
  target_users: string[] | null;
  interaction_method: string;
  input_data_source: string | null;
  input_data_type: string;
  output_schema: string | null;
  resource_requirements: string | null;
  deployment_process: string | null;
  pseudo_code: string | null;
  api_example: string | null;
  created_at: string;
  updated_at: string;
  owner_name: string | null;
  categories: { name: string } | null;
  sub_categories: { name: string } | null;
  algorithm_tags: { tags: { name: string } }[];
  approval_records: {
    id: string;
    result: string;
    comment: string | null;
    meeting_notes: string | null;
    created_at: string;
  }[];
}

export const useAlgorithms = () => {
  const [algorithms, setAlgorithms] = useState<AlgorithmAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgorithms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('algorithms')
        .select(`
          *,
          categories(name),
          sub_categories(name),
          algorithm_tags(
            tags(name)
          ),
          approval_records(
            id,
            result,
            comment,
            meeting_notes,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedAlgorithms: AlgorithmAsset[] = (data as DatabaseAlgorithm[]).map(algo => ({
        id: algo.id,
        name: algo.name,
        category: algo.categories?.name || '',
        subCategory: algo.sub_categories?.name || '',
        tags: algo.algorithm_tags?.map(at => at.tags.name) || [],
        description: algo.description || '',
        status: algo.status as any,
        owner: algo.owner_name || '',
        createdAt: algo.created_at,
        updatedAt: algo.updated_at,
        applicableScenarios: algo.applicable_scenarios || '',
        targetUsers: algo.target_users || [],
        interactionMethod: algo.interaction_method as any,
        inputDataSource: algo.input_data_source || '',
        inputDataType: algo.input_data_type as any,
        outputSchema: algo.output_schema || '',
        resourceRequirements: algo.resource_requirements || '',
        deploymentProcess: algo.deployment_process || '',
        pseudoCode: algo.pseudo_code || '',
        apiExample: algo.api_example || '',
        approvalRecords: algo.approval_records?.map(ar => ({
          id: ar.id,
          approver: '李四', // Mock approver for now
          time: ar.created_at,
          result: ar.result as any,
          comment: ar.comment || '',
          meetingNotes: ar.meeting_notes || ''
        })) || [],
        callCount: algo.call_count,
        rating: algo.rating || 0,
        popularity: algo.popularity
      }));

      setAlgorithms(transformedAlgorithms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch algorithms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlgorithms();
  }, []);

  return { algorithms, loading, error, refetch: fetchAlgorithms };
};