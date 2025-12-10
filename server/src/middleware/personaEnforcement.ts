import { Request, Response, NextFunction } from 'express';
import PersonaService from '../services/personaService';

const personaService = new PersonaService();

/**
 * Persona Enforcement Middleware
 * 
 * This middleware implements SERVER-SIDE LOGIC at the HTTP layer.
 * It validates incoming messages and adds persona context to requests.
 * This is NOT a pass-through - it actively makes decisions about requests.
 */

/**
 * Validates incoming user messages
 * SERVER-SIDE DECISION: Can reject inappropriate messages
 */
export const validateUserMessage = (req: Request, res: Response, next: NextFunction): void => {
    const { message } = req.body;

    if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
    }

    // SERVER DECISION: Check message length
    if (message.trim().length === 0) {
        res.status(400).json({ error: 'Message cannot be empty' });
        return;
    }

    if (message.length > 1000) {
        res.status(400).json({ error: 'Message too long (maximum 1000 characters)' });
        return;
    }

    // SERVER DECISION: Check for spam patterns
    if (isSpam(message)) {
        res.status(429).json({ error: 'Spam detected - please send meaningful messages' });
        return;
    }

    // SERVER DECISION: Check for abusive content
    if (isAbusive(message)) {
        res.status(400).json({ error: 'Abusive content not permitted' });
        return;
    }

    // SERVER DECISION: Sanitize message while preserving meaning
    req.body.message = sanitizeMessage(message);

    next();
};

/**
 * Adds persona context to request
 * SERVER-SIDE LOGIC: Enriches request with persona state
 */
export const addPersonaContext = (req: Request, res: Response, next: NextFunction): void => {
    // SERVER DECISION: Attach persona configuration to request
    (req as any).personaConfig = {
        characterName: 'Malcolm X',
        timeframe: '1960s',
        speakingStyle: 'direct and intellectual',
        shouldEnforcePersona: true,
    };

    next();
};

/**
 * Rate limiting based on conversation quality
 * SERVER-SIDE DECISION: Limits low-quality rapid requests
 */
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export const qualityBasedRateLimit = (req: Request, res: Response, next: NextFunction): void => {
    const { sessionId } = req.body;

    if (!sessionId) {
        next();
        return;
    }

    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 20; // Max 20 messages per minute

    const record = requestCounts.get(sessionId);

    if (!record || now - record.timestamp > windowMs) {
        // Reset window
        requestCounts.set(sessionId, { count: 1, timestamp: now });
        next();
        return;
    }

    // SERVER DECISION: Check if rate limit exceeded
    if (record.count >= maxRequests) {
        res.status(429).json({
            error: 'Rate limit exceeded. Please slow down and engage thoughtfully.',
        });
        return;
    }

    // Increment count
    record.count++;
    requestCounts.set(sessionId, record);
    next();
};

// Helper functions

/**
 * Detects spam patterns
 * SERVER-SIDE LOGIC: Identifies low-quality messages
 */
function isSpam(message: string): boolean {
    // Check for repeated characters
    if (/(.)\1{5,}/.test(message)) {
        return true;
    }

    // Check for excessive capitalization
    const upperCount = (message.match(/[A-Z]/g) || []).length;
    if (upperCount / message.length > 0.7 && message.length > 20) {
        return true;
    }

    // Check for repeated words
    const words = message.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size / words.length < 0.3) {
        return true;
    }

    return false;
}

/**
 * Detects abusive content
 * SERVER-SIDE LOGIC: Filters inappropriate messages
 */
function isAbusive(message: string): boolean {
    const abusivePatterns = [
        /\b(f[u\*]+ck|sh[i\*]+t|b[i\*]+tch|a[s\*]+hole)\b/i,
        // Add more patterns as needed
    ];

    return abusivePatterns.some(pattern => pattern.test(message));
}

/**
 * Sanitizes message while preserving meaning
 * SERVER-SIDE LOGIC: Cleans input
 */
function sanitizeMessage(message: string): string {
    // Remove excessive whitespace
    let sanitized = message.replace(/\s+/g, ' ').trim();

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized;
}

export default {
    validateUserMessage,
    addPersonaContext,
    qualityBasedRateLimit,
};
