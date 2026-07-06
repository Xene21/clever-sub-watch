import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Subscription } from '@/lib/mock-data';
import { getBrandInfo } from '@/lib/brands';

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async (): Promise<Subscription[]> => {
      const subscriptions: Subscription[] = await api.get('/subscriptions');

      // Enrich logo + color for any subscription that didn't get an
      // explicit brand set (Plaid-detected subs come back with '📦').
      return subscriptions.map((sub) => {
        const hasExplicitLogo = sub.logo && sub.logo !== '📦';
        if (hasExplicitLogo) return sub;

        const brand = getBrandInfo(sub.merchant);
        return {
          ...sub,
          logo: brand.logo,
          color: brand.color,
        };
      });
    },
    refetchOnMount: 'always', // always fetch fresh data when the page is visited
    retry: false,             // don't hammer the server with retries on error
  });
};
