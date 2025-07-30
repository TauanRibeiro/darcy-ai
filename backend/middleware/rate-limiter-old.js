const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter configurations
const rateLimiters = {
    // General API requests
    general: new RateLimiterMemory({
        keyPrefix: 'general',
        points: 60, // requests
        duration: 60, // per 60 seconds
        blockDuration: 60, // block for 60 seconds if exceeded
    }),
    
    // Chat requests (more restrictive)
    chat: new RateLimiterMemory({
        keyPrefix: 'chat',
        points: 20, // requests
        duration: 60, // per 60 seconds
        blockDuration: 120, // block for 2 minutes if exceeded
    }),
    
    // File upload requests (very restrictive)
    upload: new RateLimiterMemory({
        keyPrefix: 'upload',
        points: 5, // requests
        duration: 60, // per 60 seconds
        blockDuration: 300, // block for 5 minutes if exceeded
    }),
    
    // Search requests
    search: new RateLimiterMemory({
        keyPrefix: 'search',
        points: 30, // requests
        duration: 60, // per 60 seconds
        blockDuration: 60, // block for 1 minute if exceeded
    })
};

/**
 * Rate limiter middleware factory
 */
function createRateLimiter(type = 'general') {
    const limiter = rateLimiters[type] || rateLimiters.general;
    
    return async (req, res, next) => {
        try {
            // Use IP address as key (in production, consider using user ID)
            const key = req.ip || req.connection.remoteAddress || 'unknown';
            
            await limiter.consume(key);
            next();
            
        } catch (rateLimiterRes) {
            // Rate limit exceeded
            const secs = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1;
            
            res.set({
                'Retry-After': String(Math.round(rateLimiterRes.msBeforeNext / 1000) || 1),
                'X-RateLimit-Limit': limiter.points,
                'X-RateLimit-Remaining': rateLimiterRes.remainingPoints || 0,
                'X-RateLimit-Reset': new Date(Date.now() + rateLimiterRes.msBeforeNext)
            });
            
            res.status(429).json({
                error: 'Muitas requisições',
                message: `Limite de requisições excedido. Tente novamente em ${secs} segundos.`,
                retryAfter: secs
            });
        }
    };
}

// Specific rate limiters for different endpoints
const rateLimitMiddleware = {
    general: createRateLimiter('general'),
    chat: createRateLimiter('chat'),
    upload: createRateLimiter('upload'),
    search: createRateLimiter('search')
};

// Route-specific middleware
const routeSpecificLimiter = (req, res, next) => {
    const path = req.path.toLowerCase();
    
    if (path.includes('/chat')) {
        return rateLimitMiddleware.chat(req, res, next);
    } else if (path.includes('/upload')) {
        return rateLimitMiddleware.upload(req, res, next);
    } else if (path.includes('/search')) {
        return rateLimitMiddleware.search(req, res, next);
    } else {
        return rateLimitMiddleware.general(req, res, next);
    }
};

module.exports = routeSpecificLimiter;
