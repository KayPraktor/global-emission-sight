import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { analytics, trackAuth } from '@/services/analyticsTrackingService';

interface Organization {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  organization: Organization | null;
  roles: string[];
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

interface SignUpData {
  full_name: string;
  company_name?: string;
  job_title?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch organization membership
      const { data: orgData } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(name)')
        .eq('user_id', userId)
        .single();

      if (orgData) {
        setOrganization({
          id: orgData.organization_id,
          name: (orgData.organizations as any)?.name || 'Organization',
          role: orgData.role as 'owner' | 'admin' | 'member',
        });
        
        // Update analytics with organization context
        analytics.setUserContext(userId, orgData.organization_id);
      }

      // Fetch user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData) {
        setRoles(rolesData.map(r => r.role));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const refreshUserData = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => fetchUserData(session.user.id), 0);
          
          // Initialize analytics with user context
          analytics.initialize(session.user.id, null);
          
          // Track session start on sign in
          if (event === 'SIGNED_IN') {
            trackAuth.sessionStarted();
          }
        } else {
          setOrganization(null);
          setRoles([]);
          analytics.setUserContext(null, null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    trackAuth.started('signup');
    const startTime = Date.now();
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });
    
    if (error) {
      trackAuth.failed('signup', error.message);
      toast.error(error.message);
    } else {
      trackAuth.completed('signup', Date.now() - startTime);
      toast.success('Account created successfully!');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    trackAuth.started('signin');
    const startTime = Date.now();
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      trackAuth.failed('signin', error.message);
      toast.error(error.message);
    } else {
      trackAuth.completed('signin', Date.now() - startTime);
      toast.success('Welcome back!');
    }
    
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setOrganization(null);
      setRoles([]);
      toast.success('Signed out successfully');
    }
  };

  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = hasRole('admin');

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      organization,
      roles,
      hasRole,
      isAdmin,
      signUp, 
      signIn, 
      signOut,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
