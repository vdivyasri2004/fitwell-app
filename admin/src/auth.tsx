import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, AuthUser } from './lib/api';
import { checkIsAdmin } from './lib/admin';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser().then((u) => {
      if (!active) return;
      setUser(u);
      setLoading(false);
      if (u) {
        // Determine admin role server-side whenever a session is restored.
        checkIsAdmin().then((ok) => { if (active) setIsAdmin(ok); });
      }
    });
    return () => { active = false; };
  }, []);

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
