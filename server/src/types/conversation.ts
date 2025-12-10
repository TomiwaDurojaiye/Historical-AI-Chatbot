export interface ConversationNode {
    id: string;
    responses: string[];
    triggers?: string[];
    keywords?: string[];
    context?: string[];
    nextNodes?: string[];
    priority?: number;
    sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface Topic {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    nodes: string[];
}

export interface ContextRule {
    id: string;
    condition: string;
    action: string;
    priority: number;
}

export interface ConversationState {
    sessionId: string;
    currentNode: string;
    visitedNodes: string[];
    conversationHistory: Message[];
    context: Map<string, any>;
    topicsDiscussed: string[];
    timestamp: Date;
}

export interface Message {
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
    nodeId?: string;
    usedFallback?: boolean;
}

export interface ConversationData {
    nodes: ConversationNode[];
    topics: Topic[];
    contextRules: ContextRule[];
    defaultResponses: string[];
}

export interface MatchResult {
    node: ConversationNode;
    score: number;
    usedFallback: boolean;
}

export interface LLMConfig {
    apiKey: string;
    enabled: boolean;
    confidenceThreshold: number;
    model?: string;
}
