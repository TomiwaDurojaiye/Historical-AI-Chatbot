export interface Message {
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
    nodeId?: string;
}

export interface ChatResponse {
    response: string;
    history: Message[];
    topicsDiscussed: string[];
}

export interface SessionResponse {
    sessionId: string;
    greeting: string;
}
