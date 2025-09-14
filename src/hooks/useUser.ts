import { useUserContext } from '@/components/user/user-provider';

export const useUser = () => {
  // Thin wrapper to keep the same API
  return useUserContext();
};