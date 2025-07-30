const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for different endpoints
 */

// General API rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Muitas requisições. Tente novamente em 15 minutos.',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Chat endpoint limiter (more restrictive)
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 chat requests per minute
    message: {
        error: 'Muitas mensagens de chat. Aguarde 1 minuto.',
        code: 'CHAT_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// File upload limiter (very restrictive)
const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 uploads per 5 minutes
    message: {
        error: 'Muitos uploads. Aguarde 5 minutos.',
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Web search limiter
const searchLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 15, // limit each IP to 15 searches per 2 minutes
    message: {
        error: 'Muitas buscas na web. Aguarde 2 minutos.',
        code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    general: generalLimiter,
    chat: chatLimiter,
    upload: uploadLimiter,
    search: searchLimiter
};
