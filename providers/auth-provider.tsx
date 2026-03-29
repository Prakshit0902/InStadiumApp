import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

type AuthUser = {
  sub: string | null;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  claims: Record<string, unknown> | null;
};

type ProfileUpdateInput = {
  name?: string;
  email?: string;
  imageUrl?: string;
};

type AuthActionResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  initialized: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<AuthActionResult>;
  updateProfile: (updates: ProfileUpdateInput) => Promise<AuthActionResult>;
};

const AUTH_TOKEN_KEY = 'instadium.neon.auth.token';

const AuthContext = createContext<AuthContextValue | null>(null);

const neonAuthUrl = process.env.EXPO_PUBLIC_NEON_AUTH_URL?.trim() || '';
const appCallbackUrl = (() => {
  const configured = process.env.EXPO_PUBLIC_APP_CALLBACK_URL?.trim();
  if (configured && /^https?:\/\//i.test(configured)) {
    return configured;
  }

  try {
    return new URL('/auth/callback', new URL(neonAuthUrl).origin).toString();
  } catch {
    return 'https://example.com/auth/callback';
  }
})();

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : '';
}

function extractErrorMessage(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const target = value as Record<string, unknown>;
  const message = target.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  const nestedError = target.error;
  if (nestedError && typeof nestedError === 'object') {
    const nestedMessage = (nestedError as Record<string, unknown>).message;
    if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
      return nestedMessage;
    }
  }

  return null;
}

function getApiPath(path: string) {
  return `${neonAuthUrl.replace(/\/$/, '')}${path}`;
}

function extractUserFromAnyPayload(payload: unknown): AuthUser | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const maybeUser =
    (root.user && typeof root.user === 'object' ? (root.user as Record<string, unknown>) : null) ||
    (root.data &&
    typeof root.data === 'object' &&
    (root.data as Record<string, unknown>).user &&
    typeof (root.data as Record<string, unknown>).user === 'object'
      ? ((root.data as Record<string, unknown>).user as Record<string, unknown>)
      : null);

  if (!maybeUser) {
    return null;
  }

  const claims =
    root.claims && typeof root.claims === 'object'
      ? (root.claims as Record<string, unknown>)
      : root.user && typeof root.user === 'object' && (root.user as Record<string, unknown>).claims
        ? (((root.user as Record<string, unknown>).claims as Record<string, unknown>) ?? null)
        : null;

  const imageFromFields =
    (typeof maybeUser.image === 'string' ? maybeUser.image : null) ||
    (typeof maybeUser.imageUrl === 'string' ? maybeUser.imageUrl : null) ||
    (typeof maybeUser.picture === 'string' ? maybeUser.picture : null);

  return {
    sub: typeof maybeUser.sub === 'string' ? maybeUser.sub : null,
    email: typeof maybeUser.email === 'string' ? maybeUser.email : null,
    name: typeof maybeUser.name === 'string' ? maybeUser.name : null,
    imageUrl: imageFromFields,
    claims,
  };
}

async function callNeonAuth(path: string, body?: Record<string, unknown>, authToken?: string) {
  const origin = (() => {
    try {
      return new URL(neonAuthUrl).origin;
    } catch {
      return undefined;
    }
  })();

  const response = await fetch(getApiPath(path), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { Origin: origin } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    ok: response.ok,
    payload,
    setAuthJwt: response.headers.get('set-auth-jwt'),
  };
}

async function callNeonAuthGet(path: string, authToken?: string) {
  const origin = (() => {
    try {
      return new URL(neonAuthUrl).origin;
    } catch {
      return undefined;
    }
  })();

  const response = await fetch(getApiPath(path), {
    method: 'GET',
    credentials: 'include',
    headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    ok: response.ok,
    payload,
    setAuthJwt: response.headers.get('set-auth-jwt'),
  };
}

function findTokenCandidate(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Record<string, unknown>;
  const directToken = source.token;
  if (typeof directToken === 'string' && directToken.trim()) {
    return directToken;
  }

  const session = source.session;
  if (session && typeof session === 'object') {
    const sessionToken = (session as Record<string, unknown>).token;
    if (typeof sessionToken === 'string' && sessionToken.trim()) {
      return sessionToken;
    }
  }

  const data = source.data;
  if (data && typeof data === 'object') {
    return findTokenCandidate(data);
  }

  return null;
}

function isLikelyJwt(token: string | null): token is string {
  if (!token) {
    return false;
  }

  // JWT should be three base64url segments separated by dots.
  return token.split('.').length === 3;
}

async function readStoredToken() {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(AUTH_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

async function writeStoredToken(token: string) {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(AUTH_TOKEN_KEY, token);
      return;
    } catch {
      return;
    }
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

async function clearStoredToken() {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.removeItem(AUTH_TOKEN_KEY);
      return;
    } catch {
      return;
    }
  }

  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const clearLocalSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clearStoredToken();
  }, []);

  const applyToken = useCallback(async (nextToken: string) => {
    setToken(nextToken);
    await writeStoredToken(nextToken);
  }, []);

  const refreshProfile = useCallback(async (): Promise<AuthActionResult> => {
    const baseUrl = getApiBaseUrl();
    const currentToken = token || (await readStoredToken());

    if (!baseUrl) {
      return { ok: false, message: 'Missing EXPO_PUBLIC_API_BASE_URL in app env.' };
    }

    if (!currentToken) {
      return { ok: false, message: 'No auth token found. Please sign in.' };
    }

    try {
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await clearLocalSession();
        }

        const fallbackMessage = `Profile request failed (${response.status}).`;
        return { ok: false, message: fallbackMessage };
      }

      const payload = (await response.json()) as {
        user?: {
          sub?: string | null;
          email?: string | null;
          name?: string | null;
          claims?: Record<string, unknown>;
        };
      };

      setToken(currentToken);
      const claimsImage =
        (typeof payload.user?.claims?.image === 'string' ? payload.user.claims.image : null) ||
        (typeof payload.user?.claims?.imageUrl === 'string' ? payload.user.claims.imageUrl : null) ||
        (typeof payload.user?.claims?.picture === 'string' ? payload.user.claims.picture : null);
      setUser({
        sub: payload.user?.sub ?? null,
        email: payload.user?.email ?? null,
        name: payload.user?.name ?? null,
        imageUrl: claimsImage,
        claims: payload.user?.claims ?? null,
      });

      return { ok: true };
    } catch {
      return { ok: false, message: 'Failed to contact backend.' };
    }
  }, [clearLocalSession, token]);

  const resolveJwtToken = useCallback(async (responsePayload?: unknown) => {
    return findTokenCandidate(responsePayload);
  }, []);

  const resolveJwtTokenFromSession = useCallback(async (): Promise<string | null> => {
    const endpoints = ['/get-session', '/session'];

    for (const endpoint of endpoints) {
      try {
        const result = await callNeonAuthGet(endpoint);
        const token = result.setAuthJwt || findTokenCandidate(result.payload);
        if (isLikelyJwt(token)) {
          return token;
        }
      } catch {
        // Try next endpoint.
      }
    }

    return null;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!neonAuthUrl) {
        return { ok: false, message: 'Missing EXPO_PUBLIC_NEON_AUTH_URL in app env.' };
      }

      try {
        const result = await callNeonAuth('/sign-in/email', { email, password, callbackURL: appCallbackUrl });
        const message = extractErrorMessage(result.payload);
        if (!result.ok) {
          return { ok: false, message: message || 'Invalid email or password.' };
        }

        if (message) {
          return { ok: false, message };
        }

        const resolvedToken =
          result.setAuthJwt || (await resolveJwtToken(result.payload)) || (await resolveJwtTokenFromSession());
        if (!isLikelyJwt(resolvedToken)) {
          return {
            ok: false,
            message:
              'Signed in, but no JWT token was returned. Try again, and if it persists use a development build instead of Expo Go.',
          };
        }
        const jwtToken = resolvedToken;

        await applyToken(jwtToken);
        const profile = await refreshProfile();
        if (!profile.ok) {
          return { ok: false, message: 'Signed in, but backend authorization failed. Please try again.' };
        }

        return { ok: true };
      } catch {
        return { ok: false, message: 'Sign in failed. Please try again.' };
      }
    },
    [applyToken, refreshProfile, resolveJwtToken, resolveJwtTokenFromSession]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthActionResult> => {
      if (!neonAuthUrl) {
        return { ok: false, message: 'Missing EXPO_PUBLIC_NEON_AUTH_URL in app env.' };
      }

      try {
        const result = await callNeonAuth('/sign-up/email', { name, email, password, callbackURL: appCallbackUrl });
        const message = extractErrorMessage(result.payload);
        if (!result.ok) {
          return { ok: false, message: message || 'Sign up failed.' };
        }

        if (message) {
          return { ok: false, message };
        }

        const resolvedToken = result.setAuthJwt || (await resolveJwtToken(result.payload));
        if (!isLikelyJwt(resolvedToken)) {
          return { ok: true, message: 'Account created. Please sign in to continue.' };
        }
        const jwtToken = resolvedToken;

        await applyToken(jwtToken);
        const profile = await refreshProfile();
        if (!profile.ok) {
          await clearLocalSession();
          return { ok: true, message: 'Account created. Please sign in to continue.' };
        }

        return { ok: true };
      } catch {
        return { ok: false, message: 'Sign up failed. Please try again.' };
      }
    },
    [applyToken, clearLocalSession, refreshProfile, resolveJwtToken]
  );

  const signOut = useCallback(async () => {
    // Local sign-out is sufficient for mobile because backend auth is bearer-token based.
    // The app can optionally call Neon Auth sign-out later when cookie sessions are needed.

    await clearLocalSession();
  }, [clearLocalSession]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdateInput): Promise<AuthActionResult> => {
      if (!neonAuthUrl) {
        return { ok: false, message: 'Missing EXPO_PUBLIC_NEON_AUTH_URL in app env.' };
      }

      const currentToken = token || (await readStoredToken());
      if (!currentToken) {
        return { ok: false, message: 'Please sign in first.' };
      }

      const trimmedName = updates.name?.trim();
      const trimmedEmail = updates.email?.trim();
      const trimmedImageUrl = updates.imageUrl?.trim();

      const payload: Record<string, unknown> = {
        callbackURL: appCallbackUrl,
      };
      if (trimmedName) {
        payload.name = trimmedName;
      }
      if (trimmedEmail) {
        payload.email = trimmedEmail;
      }
      if (trimmedImageUrl) {
        payload.image = trimmedImageUrl;
      }

      try {
        const result = await callNeonAuth('/update-user', payload, currentToken);
        const message = extractErrorMessage(result.payload);
        if (!result.ok) {
          return { ok: false, message: message || 'Failed to update profile.' };
        }

        const updated = extractUserFromAnyPayload(result.payload);
        if (updated) {
          setUser((prev) => ({
            sub: updated.sub ?? prev?.sub ?? null,
            email: updated.email ?? prev?.email ?? null,
            name: updated.name ?? prev?.name ?? null,
            imageUrl: updated.imageUrl ?? prev?.imageUrl ?? null,
            claims: updated.claims ?? prev?.claims ?? null,
          }));
        } else {
          setUser((prev) => ({
            sub: prev?.sub ?? null,
            email: trimmedEmail ?? prev?.email ?? null,
            name: trimmedName ?? prev?.name ?? null,
            imageUrl: trimmedImageUrl ?? prev?.imageUrl ?? null,
            claims: prev?.claims ?? null,
          }));
        }

        return { ok: true, message: 'Profile updated.' };
      } catch {
        return { ok: false, message: 'Failed to update profile.' };
      }
    },
    [token]
  );

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      const savedToken = await readStoredToken();

      if (!active) {
        return;
      }

      if (savedToken) {
        setToken(savedToken);
      }

      await refreshProfile();

      if (active) {
        setInitialized(true);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      isAuthenticated: Boolean(token),
      token,
      user,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [initialized, refreshProfile, signIn, signOut, signUp, token, updateProfile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
