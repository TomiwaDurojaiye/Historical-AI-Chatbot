import axios from 'axios';
import { ChatResponse, SessionResponse } from '../types/chat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const chatService = {
    createSession: async (): Promise<SessionResponse> => {
        const response = await axios.post<SessionResponse>(`${API_BASE_URL}/chat/session`);
        return response.data;
    },

    sendMessage: async (sessionId: string, message: string): Promise<ChatResponse> => {
        const response = await axios.post<ChatResponse>(`${API_BASE_URL}/chat/message`, {
            sessionId,
            message,
        });
        return response.data;
    },

    resetConversation: async (sessionId: string): Promise<void> => {
        await axios.post(`${API_BASE_URL}/chat/reset`, { sessionId });
    },

    getHistory: async (sessionId: string): Promise<ChatResponse> => {
        const response = await axios.get<ChatResponse>(
            `${API_BASE_URL}/chat/history/${sessionId}`
        );
        return response.data;
    },
};
