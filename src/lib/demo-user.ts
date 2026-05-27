import { useAuth } from '@/hooks/useAuth';

export const DEMO_EMAIL = 'user@yopmail.com';

export const isDemoEmail = (email?: string | null) =>
  !!email && email.toLowerCase() === DEMO_EMAIL;

export const useIsDemoUser = () => {
  const { user } = useAuth();
  return isDemoEmail(user?.email);
};
