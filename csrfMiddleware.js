import crypto from 'crypto';

// In-memory token store (for single-server deployment)
// For production with multiple servers, use Redis or database
const tokenStore = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

// Clean expired tokens periodically
setInterval(() => {
    const now = Date.now();
    for (const [token, data] of tokenStore.entries()) {
        if (now > data.expires) {
            tokenStore.delete(token);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Generate a new CSRF token
 * @returns {string} The generated token
 */
export function generateToken() {
    const token = crypto.randomBytes(32).toString('hex');
    tokenStore.set(token, {
        expires: Date.now() + TOKEN_EXPIRY,
        used: false
    });
    return token;
}

/**
 * Validate and consume a CSRF token
 * @param {string} token - The token to validate
 * @returns {boolean} Whether the token is valid
 */
export function validateToken(token) {
    if (!token || typeof token !== 'string') {
        return false;
    }

    const tokenData = tokenStore.get(token);

    if (!tokenData) {
        return false;
    }

    if (Date.now() > tokenData.expires) {
        tokenStore.delete(token);
        return false;
    }

    // Mark as used to prevent replay attacks
    tokenStore.delete(token);
    return true;
}

/**
 * Express middleware to validate CSRF token
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export function csrfMiddleware(req, res, next) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'] || req.body?._csrf;

    if (!validateToken(token)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or missing CSRF token'
        });
    }

    next();
}

export default { generateToken, validateToken, csrfMiddleware };
