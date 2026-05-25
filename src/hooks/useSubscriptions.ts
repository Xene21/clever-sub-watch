import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Subscription } from '@/lib/mock-data';

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async (): Promise<Subscription[]> => {
      return api.get('/subscriptions');
    },
  });
};
