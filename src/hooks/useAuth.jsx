import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsAdmin(false);
        setSupabaseUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setIsAdmin(data.role === 'admin');
        setSupabaseUser(data);
      } else {
        setIsAdmin(false);
        setSupabaseUser(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setIsAdmin(false);
      setSupabaseUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAdmin,
    supabaseUser,
    loading,
    logout: async () => {
      await supabase.auth.signOut();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
