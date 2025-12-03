import express from 'express';
import {
    sendMessage,
    resetConversation,
    getHistory,
    createSession,
} from '../controllers/chatController';

const router = express.Router();

// Create new chat session
router.post('/session', createSession);

// Send message and get response
router.post('/message', sendMessage);

// Reset conversation
router.post('/reset', resetConversation);

// Get conversation history
router.get('/history/:sessionId', getHistory);

export default router;
