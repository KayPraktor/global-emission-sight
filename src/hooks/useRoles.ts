import { useAuth } from '@/contexts/AuthContext';

export const useRoles = () => {
  const { roles, hasRole, isAdmin, organization } = useAuth();

  const isOwner = organization?.role === 'owner';
  const isOrgAdmin = organization?.role === 'admin' || isOwner;

  return {
    roles,
    hasRole,
    isAdmin,
    isOwner,
    isOrgAdmin,
    organization,
  };
};
