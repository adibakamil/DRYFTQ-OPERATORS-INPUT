import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import * as auth from '../services/auth';
import type { Credentials } from '../services/auth';
import type { Role, SessionUser } from '../types';

interface AuthContextValue {
  user: SessionUser | null;
  signIn: (credentials: Credentials) => Promise<SessionUser>;
  chooseRole: (role: Role) => void;
  switchRole: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => auth.getSession());

  const signIn = useCallback(async (credentials: Credentials) => {
    const session = await auth.signIn(credentials);
    auth.saveSession(session);
    setUser(session);
    return session;
  }, []);

  const chooseRole = useCallback((role: Role) => {
    const updated = auth.applyRole(role);
    if (updated) setUser(updated);
  }, []);

  const switchRole = useCallback(() => {
    const updated = auth.resetRoleConfirmation();
    if (updated) setUser(updated);
  }, []);

  const signOut = useCallback(() => {
    auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, chooseRole, switchRole, signOut }),
    [user, signIn, chooseRole, switchRole, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
