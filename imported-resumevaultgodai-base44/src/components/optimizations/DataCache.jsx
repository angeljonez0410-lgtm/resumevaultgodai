import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Optimized data fetching with caching
export const useCachedProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      return profiles?.[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCachedApplications = (limit = 10) => {
  return useQuery({
    queryKey: ['job-applications', limit],
    queryFn: async () => {
      return await base44.entities.JobApplication.list('-created_date', limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCachedSubscription = () => {
  return useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const subs = await base44.entities.UserSubscription.filter({ created_by: user.email });
      return subs?.[0] || null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
};