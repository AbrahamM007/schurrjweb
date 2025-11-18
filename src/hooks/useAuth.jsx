import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', u.email)
          .maybeSingle();

        if (data) {
          setIsAdmin(data.is_admin);
          setSupabaseUser(data);
        }
      } else {
        setIsAdmin(false);
        setSupabaseUser(null);
      }
    });
    return () => unsub();
  }, []);

  const value = {
    user,
    isAdmin,
    supabaseUser,
    logout: () => signOut(auth)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
