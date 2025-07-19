
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the correct redirect URL based on environment
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      // Always use production URL for production and preview environments
      if (window.location.hostname === 'safespender.lovable.app' || 
          window.location.hostname.includes('lovable.app') ||
          window.location.protocol === 'https:') {
        return 'https://safespender.lovable.app/';
      }
      // Only use localhost for local development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `${window.location.origin}/`;
      }
    }
    // Default to production URL
    return 'https://safespender.lovable.app/';
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setIsLoading(false);
    
    if (error) {
      // Return user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Incorrect email or password. Please try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Please check your email and click the confirmation link before signing in.' };
      }
      if (error.message.includes('Too many requests')) {
        return { error: 'Too many login attempts. Please wait a few minutes before trying again.' };
      }
      if (error.message.includes('Signup requires a valid password')) {
        return { error: 'Please enter a valid password.' };
      }
      if (error.message.includes('Invalid email')) {
        return { error: 'Please enter a valid email address.' };
      }
      return { error: error.message };
    }
    
    return {};
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    
    const redirectUrl = getRedirectUrl();
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    setIsLoading(false);
    
    if (error) {
      // Return user-friendly error messages
      if (error.message.includes('User already registered')) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }
      if (error.message.includes('Password should be at least 6 characters')) {
        return { error: 'Password must be at least 6 characters long.' };
      }
      if (error.message.includes('Signup requires a valid password')) {
        return { error: 'Please enter a valid password.' };
      }
      if (error.message.includes('Invalid email')) {
        return { error: 'Please enter a valid email address.' };
      }
      if (error.message.includes('Unable to validate email address')) {
        return { error: 'Please enter a valid email address.' };
      }
      return { error: error.message };
    }
    
    return {};
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, login, signUp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
