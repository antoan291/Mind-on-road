import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient, ApiClientError } from './apiClient';

export type AuthenticatedUser = {
  id?: string;
  email: string;
  displayName: string;
  roleKeys: string[];
  permissionKeys: string[];
};

export type AuthenticatedSession = {
  csrfToken: string;
  sessionId: string;
  expiresAt: string;
  tenantId?: string;
  tenantSlug: string;
  mustChangePassword: boolean;
  user: AuthenticatedUser;
};

export type LoginPayload = {
  tenantSlug: string;
  email: string;
  password: string;
};

type AuthState = 'loading' | 'authenticated' | 'anonymous';

type AuthSessionContextValue = {
  authState: AuthState;
  session: AuthenticatedSession | null;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | undefined>(
  undefined,
);

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [session, setSession] = useState<AuthenticatedSession | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const currentSession =
        await apiClient.get<AuthenticatedSession>('/auth/me');
      setSession(currentSession);
      setAuthState('authenticated');
      setAuthError(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 401) {
        setSession(null);
        setAuthState('anonymous');
        setAuthError(null);
        return;
      }

      setSession(null);
      setAuthState('anonymous');
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Неуспешна проверка на сесията.',
      );
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const nextSession = await apiClient.post<AuthenticatedSession>(
      '/auth/login',
      payload,
    );

    setSession(nextSession);
    setAuthState('authenticated');
    setAuthError(null);
  }, []);

  const logout = useCallback(async () => {
    if (session?.csrfToken) {
      await apiClient.post<void>('/auth/logout', undefined, session.csrfToken);
    }

    setSession(null);
    setAuthState('anonymous');
    setAuthError(null);
  }, [session?.csrfToken]);

  const value = useMemo<AuthSessionContextValue>(
    () => ({
      authState,
      session,
      authError,
      login,
      logout,
      refreshSession,
    }),
    [authError, authState, login, logout, refreshSession, session],
  );

  return (
    <AuthSessionContext.Provider value={value}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error(
      'useAuthSession must be used inside AuthSessionProvider.',
    );
  }

  return context;
}
