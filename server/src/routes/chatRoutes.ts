import express from 'express';
import {
    sendMessage,
    resetConversation,
    getHistory,
    createSession,
} from '../controllers/chatController';
import {
    validateUserMessage,
    addPersonaContext,
    qualityBasedRateLimit,
} from '../middleware/personaEnforcement';

const router = express.Router();

/**
 * Enhanced Routes with Server-Side Middleware
 * 
 * These routes demonstrate proper MVC architecture with middleware layers
 * that implement meaningful business logic before reaching controllers.
 */

// Create new chat session
// No special middleware needed for session creation
router.post('/session', createSession);

// Send message and get response
// SERVER-SIDE LOGIC: Apply validation, persona context, and rate limiting
router.post(
    '/message',
    validateUserMessage,       // Step 1: Validate and sanitize message (server logic)
    addPersonaContext,          // Step 2: Add persona configuration (server logic)
    qualityBasedRateLimit,      // Step 3: Rate limit based on quality (server logic)
    sendMessage                 // Step 4: Process with full business logic (controller)
);

// Reset conversation
router.post('/reset', resetConversation);

// Get conversation history  
router.get('/history/:sessionId', getHistory);

export default router;
