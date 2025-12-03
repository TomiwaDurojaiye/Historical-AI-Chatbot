import { Request, Response } from 'express';
import { ConversationEngine } from '../engine/conversationEngine';

const conversationEngine = new ConversationEngine();

export const sendMessage = (req: Request, res: Response): void => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            res.status(400).json({
                error: 'Session ID and message are required'
            });
            return;
        }

        const response = conversationEngine.processMessage(sessionId, message);
        const history = conversationEngine.getConversationHistory(sessionId);
        const topics = conversationEngine.getTopicsDiscussed(sessionId);

        res.json({
            response,
            history: history.slice(-10), // Last 10 messages
            topicsDiscussed: topics.map(t => t.name),
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const resetConversation = (req: Request, res: Response): void => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            res.status(400).json({
                error: 'Session ID is required'
            });
            return;
        }

        conversationEngine.resetSession(sessionId);

        res.json({
            message: 'Conversation reset successfully',
            sessionId,
        });
    } catch (error) {
        console.error('Error resetting conversation:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const getHistory = (req: Request, res: Response): void => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            res.status(400).json({
                error: 'Session ID is required'
            });
            return;
        }

        const history = conversationEngine.getConversationHistory(sessionId);
        const topics = conversationEngine.getTopicsDiscussed(sessionId);

        res.json({
            history,
            topicsDiscussed: topics,
        });
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const createSession = (req: Request, res: Response): void => {
    try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        conversationEngine.createSession(sessionId);

        // Get initial greeting
        const greeting = conversationEngine.processMessage(sessionId, 'hello');

        res.json({
            sessionId,
            greeting,
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};
