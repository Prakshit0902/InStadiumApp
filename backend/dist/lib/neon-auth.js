import { createRemoteJWKSet, jwtVerify } from 'jose';
const AUTH_CONTEXT_KEY = '__neonAuthContext';
const AUTH_PREFIX = 'Bearer ';
let cachedJwksUrl = null;
let cachedJwks = null;
function getAuthConfig() {
    const jwksUrl = process.env.NEON_AUTH_JWKS_URL?.trim();
    const issuer = process.env.NEON_AUTH_ISSUER?.trim();
    const audience = process.env.NEON_AUTH_AUDIENCE?.trim();
    if (!jwksUrl || !issuer) {
        return null;
    }
    return {
        jwksUrl,
        issuer,
        audience: audience || undefined,
    };
}
function getJwks(jwksUrl) {
    if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
        cachedJwksUrl = jwksUrl;
        cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
    }
    return cachedJwks;
}
function getBearerToken(req) {
    const header = req.header('authorization');
    if (!header || !header.startsWith(AUTH_PREFIX)) {
        return null;
    }
    const token = header.slice(AUTH_PREFIX.length).trim();
    return token || null;
}
async function verifyToken(token) {
    const config = getAuthConfig();
    if (!config) {
        throw new Error('NEON_AUTH_NOT_CONFIGURED');
    }
    const verification = await jwtVerify(token, getJwks(config.jwksUrl), {
        issuer: config.issuer,
        audience: config.audience,
    });
    return verification.payload;
}
function saveAuthContext(req, context) {
    Reflect.set(req, AUTH_CONTEXT_KEY, context);
}
export function getNeonAuthContext(req) {
    const context = Reflect.get(req, AUTH_CONTEXT_KEY);
    return context ?? null;
}
export async function requireNeonAuth(req, res, next) {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }
    try {
        const payload = await verifyToken(token);
        saveAuthContext(req, { payload, token });
        return next();
    }
    catch (error) {
        if (error.message === 'NEON_AUTH_NOT_CONFIGURED') {
            return res.status(503).json({
                error: 'Neon Auth is not configured on backend. Set NEON_AUTH_JWKS_URL and NEON_AUTH_ISSUER.',
            });
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
export function requireNeonAdmin(req, res, next) {
    const auth = getNeonAuthContext(req);
    if (!auth) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    const allowListRaw = process.env.NEON_AUTH_ADMIN_EMAILS?.trim();
    if (!allowListRaw) {
        return next();
    }
    const allowList = new Set(allowListRaw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean));
    if (allowList.size === 0) {
        return next();
    }
    const email = typeof auth.payload.email === 'string' ? auth.payload.email.toLowerCase() : '';
    if (!email || !allowList.has(email)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    return next();
}
