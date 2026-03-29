import { useAuth as useClerkAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-expo';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

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

const AuthContext = createContext<AuthContextValue | null>(null);

function getApiBaseUrl() {
  const base = process.env.EXPO_PUBLIC_API_BASE_URL;
  return base ? base.replace(/\/$/, '') : '';
}

function extractErrorMessage(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const target = value as Record<string, unknown>;
  const errors = target.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (first && typeof first === 'object') {
      const firstMessage = (first as Record<string, unknown>).message;
      if (typeof firstMessage === 'string' && firstMessage.trim()) {
        return firstMessage;
      }
    }
  }

  if (typeof target.error === 'string' && target.error.trim()) {
    return target.error;
  }

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

  const upstream = target.upstream;
  if (upstream && typeof upstream === 'object') {
    const upstreamMessage = (upstream as Record<string, unknown>).message;
    if (typeof upstreamMessage === 'string' && upstreamMessage.trim()) {
      return upstreamMessage;
    }

    const upstreamError = (upstream as Record<string, unknown>).error;
    if (upstreamError && typeof upstreamError === 'object') {
      const upstreamNestedMessage = (upstreamError as Record<string, unknown>).message;
      if (typeof upstreamNestedMessage === 'string' && upstreamNestedMessage.trim()) {
        return upstreamNestedMessage;
      }
    }
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useClerkAuth();
  const { isLoaded: userLoaded, user: clerkUser } = useUser();
  const { isLoaded: signInLoaded, signIn: clerkSignIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp: clerkSignUp, setActive: setSignUpActive } = useSignUp();

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const refreshProfile = useCallback(async (): Promise<AuthActionResult> => {
    const baseUrl = getApiBaseUrl();

    if (!baseUrl) {
      return { ok: false, message: 'Missing EXPO_PUBLIC_API_BASE_URL in app env.' };
    }

    if (!isSignedIn) {
      setToken(null);
      setCurrentUser(null);
      return { ok: false, message: 'Please sign in first.' };
    }

    const currentToken = await getToken();
    if (!currentToken) {
      setToken(null);
      setCurrentUser(null);
      return { ok: false, message: 'No Clerk session token available.' };
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
          setToken(null);
          setCurrentUser(null);
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
      setCurrentUser({
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
  }, [getToken, isSignedIn]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      if (!signInLoaded || !authLoaded) {
        return { ok: false, message: 'Auth is still loading. Please try again.' };
      }

      try {
        const result = await clerkSignIn.create({
          identifier: email,
          password,
        });

        if (result.status !== 'complete' || !result.createdSessionId) {
          return { ok: false, message: 'Sign in could not be completed.' };
        }

        await setSignInActive({ session: result.createdSessionId });
        const profile = await refreshProfile();
        if (!profile.ok) {
          return { ok: false, message: 'Signed in, but backend authorization failed. Please try again.' };
        }

        return { ok: true };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error) || 'Sign in failed. Please try again.' };
      }
    },
    [authLoaded, clerkSignIn, refreshProfile, setSignInActive, signInLoaded]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthActionResult> => {
      if (!signUpLoaded || !authLoaded) {
        return { ok: false, message: 'Auth is still loading. Please try again.' };
      }

      const [firstName, ...rest] = name.trim().split(/\s+/);
      const lastName = rest.length > 0 ? rest.join(' ') : undefined;

      try {
        const result = await clerkSignUp.create({
          emailAddress: email,
          password,
          firstName: firstName || undefined,
          lastName,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setSignUpActive({ session: result.createdSessionId });
          const profile = await refreshProfile();
          if (!profile.ok) {
            return { ok: true, message: 'Account created. Please sign in again to continue.' };
          }

          return { ok: true };
        }

        return { ok: true, message: 'Account created. Complete Clerk verification to continue.' };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error) || 'Sign up failed. Please try again.' };
      }
    },
    [authLoaded, clerkSignUp, refreshProfile, setSignUpActive, signUpLoaded]
  );

  const signOut = useCallback(async () => {
    await clerkSignOut();
    setToken(null);
    setCurrentUser(null);
  }, [clerkSignOut]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdateInput): Promise<AuthActionResult> => {
      if (!userLoaded || !clerkUser) {
        return { ok: false, message: 'Please sign in first.' };
      }

      const trimmedName = updates.name?.trim();
      const trimmedEmail = updates.email?.trim();
      const trimmedImageUrl = updates.imageUrl?.trim();

      const [firstName, ...rest] = (trimmedName || clerkUser.fullName || '').split(/\s+/);
      const lastName = rest.length > 0 ? rest.join(' ') : '';

      if (trimmedEmail && trimmedEmail !== clerkUser.primaryEmailAddress?.emailAddress) {
        return {
          ok: false,
          message: 'Email updates require Clerk email verification flow. Update it in Clerk user settings.',
        };
      }

      try {
        await clerkUser.update({
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          unsafeMetadata: {
            ...(typeof clerkUser.unsafeMetadata === 'object' ? clerkUser.unsafeMetadata : {}),
            ...(trimmedImageUrl ? { imageUrl: trimmedImageUrl } : {}),
          },
        });

        setCurrentUser((prev) => ({
          sub: prev?.sub ?? null,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? prev?.email ?? null,
          name: trimmedName || clerkUser.fullName || prev?.name || null,
          imageUrl: trimmedImageUrl || prev?.imageUrl || null,
          claims: prev?.claims ?? null,
        }));

        return { ok: true, message: 'Profile updated.' };
      } catch (error) {
        return { ok: false, message: extractErrorMessage(error) || 'Failed to update profile.' };
      }
    },
    [clerkUser, userLoaded]
  );

  const initialized = authLoaded && userLoaded;

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isSignedIn) {
      setToken(null);
      setCurrentUser(null);
      return;
    }

    void refreshProfile();
  }, [initialized, isSignedIn, refreshProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      initialized,
      isAuthenticated: Boolean(isSignedIn),
      token,
      user: currentUser,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [currentUser, initialized, isSignedIn, refreshProfile, signIn, signOut, signUp, token, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
