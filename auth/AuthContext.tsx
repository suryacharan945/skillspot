import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';


interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUserFromSession = async (session: Session | null) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          setUser(profile as User);
          try {
            localStorage.setItem('skillspot_demo_user', JSON.stringify(profile));
          } catch {}
          return;
        }

        // Profile does not exist yet; construct user profile from OAuth session metadata
        const userEmail = session.user.email || '';
        const userName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          (userEmail ? userEmail.split('@')[0] : 'Student');
        const userAvatar =
          session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture ||
          undefined;

        const newUserProfile: User = {
          id: session.user.id,
          email: userEmail,
          name: userName,
          role: 'student',
          avatarUrl: userAvatar,
        };

        // Try upserting to public.users table so it is persisted in Supabase
        const { error: upsertError } = await supabase.from('users').upsert(
          {
            id: newUserProfile.id,
            email: newUserProfile.email,
            name: newUserProfile.name,
            role: newUserProfile.role,
            avatarUrl: newUserProfile.avatarUrl,
          },
          { onConflict: 'id' }
        );

        if (upsertError) {
          console.warn(
            'Could not persist OAuth profile to public.users (likely RLS policy). Continuing with authenticated session:',
            upsertError
          );
        }

        // Crucial: ALWAYS keep authenticated OAuth user logged in
        setUser(newUserProfile);
        try {
          localStorage.setItem('skillspot_demo_user', JSON.stringify(newUserProfile));
        } catch {}
      } catch (err) {
        console.error('Error handling session profile:', err);
        // Fallback user from session metadata so user is never locked out
        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email || 'user@skillspot.org',
          name: session.user.user_metadata?.full_name || 'Student',
          role: 'student',
        };
        setUser(fallbackUser);
        try {
          localStorage.setItem('skillspot_demo_user', JSON.stringify(fallbackUser));
        } catch {}
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Flag to prevent the auth listener from firing until the initial session is fetched.
    let isFetchingSession = true;

    const fetchInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          await updateUserFromSession(session);
        } else {
          // Check demo user
          try {
            const savedDemo = localStorage.getItem('skillspot_demo_user');
            if (savedDemo) {
              setUser(JSON.parse(savedDemo));
            } else {
              setUser(null);
            }
          } catch {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error fetching initial user session:', error);
        try {
          const savedDemo = localStorage.getItem('skillspot_demo_user');
          setUser(savedDemo ? JSON.parse(savedDemo) : null);
        } catch {
          setUser(null);
        }
      } finally {
        isFetchingSession = false;
        setLoading(false);
      }
    };

    fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        // Only run the listener logic after the initial session fetch is complete.
        if (!isFetchingSession) {
          try {
            if (session) {
              await updateUserFromSession(session);
            } else {
              const savedDemo = localStorage.getItem('skillspot_demo_user');
              if (savedDemo) {
                setUser(JSON.parse(savedDemo));
              } else {
                setUser(null);
              }
            }
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setUser(null);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (loggedInUser: User) => {
    try {
      localStorage.setItem('skillspot_demo_user', JSON.stringify(loggedInUser));
    } catch {}
    setUser(loggedInUser);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('skillspot_demo_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to update demo user in storage', e);
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      localStorage.removeItem('skillspot_demo_user');
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signout warning:', error);
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};