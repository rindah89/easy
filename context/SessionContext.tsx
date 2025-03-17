import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Context type
type SessionContextType = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

// Create context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Provider component
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(data.session);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Function to sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load session on mount and setup auth state change listener
  useEffect(() => {
    let mounted = true;

    // Get initial session
    async function getInitialSession() {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Only update state if component is still mounted
        if (mounted) {
          setSession(data.session);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    getInitialSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`Auth event: ${event}`);
        
        if (mounted) {
          setSession(newSession);
        }
      }
    );

    // Cleanup
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Context value
  const value = {
    session,
    loading,
    signOut,
    refreshSession,
  };

  // Provider
  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// Custom hook to use the session context
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

// Export context for more advanced use cases
export { SessionContext }; 