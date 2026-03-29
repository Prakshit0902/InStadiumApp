import type { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

type AuthContext = {
  payload: JWTPayload;
  token: string;
};

const AUTH_CONTEXT_KEY = '__clerkAuthContext' as const;
const AUTH_PREFIX = 'Bearer ';

let cachedJwksUrl: string | null = null;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getAuthConfig() {
  const issuer = process.env.CLERK_ISSUER?.trim();
  const explicitJwksUrl = process.env.CLERK_JWKS_URL?.trim();
  const audience = process.env.CLERK_AUDIENCE?.trim();
  const authorizedPartiesRaw = process.env.CLERK_AUTHORIZED_PARTIES?.trim();

  if (!issuer) {
    return null;
  }

  const jwksUrl = explicitJwksUrl || `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
  const authorizedParties = authorizedPartiesRaw
    ? authorizedPartiesRaw.split(',').map((value) => value.trim()).filter(Boolean)
    : undefined;

  return {
    issuer,
    jwksUrl,
    audience: audience || undefined,
    authorizedParties,
  };
}

function getJwks(jwksUrl: string) {
  if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  return cachedJwks;
}

function getBearerToken(req: Request) {
  const header = req.header('authorization');
  if (!header || !header.startsWith(AUTH_PREFIX)) {
    return null;
  }

  const token = header.slice(AUTH_PREFIX.length).trim();
  return token || null;
}

async function verifyToken(token: string) {
  const config = getAuthConfig();
  if (!config) {
    throw new Error('CLERK_AUTH_NOT_CONFIGURED');
  }

  const verification = await jwtVerify(token, getJwks(config.jwksUrl), {
    issuer: config.issuer,
    audience: config.audience,
  });

  const azp = typeof verification.payload.azp === 'string' ? verification.payload.azp : null;
  if (config.authorizedParties && config.authorizedParties.length > 0) {
    if (!azp || !config.authorizedParties.includes(azp)) {
      throw new Error('CLERK_INVALID_AZP');
    }
  }

  return verification.payload;
}

function saveAuthContext(req: Request, context: AuthContext) {
  Reflect.set(req, AUTH_CONTEXT_KEY, context);
}

export function getClerkAuthContext(req: Request): AuthContext | null {
  const context = Reflect.get(req, AUTH_CONTEXT_KEY) as AuthContext | undefined;
  return context ?? null;
}

export async function requireClerkAuth(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  try {
    const payload = await verifyToken(token);
    saveAuthContext(req, { payload, token });
    return next();
  } catch (error) {
    if ((error as Error).message === 'CLERK_AUTH_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'Clerk auth is not configured on backend. Set CLERK_ISSUER (and optional CLERK_JWKS_URL).',
      });
    }

    if ((error as Error).message === 'CLERK_INVALID_AZP') {
      return res.status(401).json({ error: 'Unauthorized token origin' });
    }

    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireClerkAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = getClerkAuthContext(req);
  if (!auth) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const allowListRaw = process.env.CLERK_ADMIN_EMAILS?.trim();
  if (!allowListRaw) {
    return next();
  }

  const allowList = new Set(
    allowListRaw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );

  if (allowList.size === 0) {
    return next();
  }

  const emailClaim = auth.payload.email ?? auth.payload.email_address;
  const email = typeof emailClaim === 'string' ? emailClaim.toLowerCase() : '';

  if (!email || !allowList.has(email)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
}
