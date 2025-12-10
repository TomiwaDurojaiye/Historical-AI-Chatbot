import natural from 'natural';
import {
    ConversationNode,
    ConversationState,
    ConversationData,
    Message,
    Topic,
    MatchResult,
} from '../types/conversation';
import conversationData from '../data/malcolmx-conversation.json';
import LLMService from '../services/llmService';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

export class ConversationEngine {
    private data: ConversationData;
    private sessions: Map<string, ConversationState>;
    private tfidf: any;
    private llmService: LLMService;
    private confidenceThreshold: number;

    constructor() {
        this.data = conversationData as ConversationData;
        this.sessions = new Map();
        this.tfidf = new TfIdf();
        this.llmService = new LLMService();
        this.confidenceThreshold = parseFloat(process.env.LLM_CONFIDENCE_THRESHOLD || '3.0');
        this.initializeTfIdf();
    }

    private initializeTfIdf(): void {
        // Index all conversation nodes for better matching
        this.data.nodes.forEach((node) => {
            const combinedText = [
                ...(node.triggers || []),
                ...(node.keywords || []),
                ...(node.context || []),
            ].join(' ');
            this.tfidf.addDocument(combinedText);
        });
    }

    createSession(sessionId: string): ConversationState {
        const session: ConversationState = {
            sessionId,
            currentNode: 'greeting',
            visitedNodes: [],
            conversationHistory: [],
            context: new Map(),
            topicsDiscussed: [],
            timestamp: new Date(),
        };
        this.sessions.set(sessionId, session);
        return session;
    }

    getSession(sessionId: string): ConversationState | undefined {
        return this.sessions.get(sessionId);
    }

    resetSession(sessionId: string): ConversationState {
        this.sessions.delete(sessionId);
        return this.createSession(sessionId);
    }

    async processMessage(sessionId: string, userMessage: string): Promise<string> {
        let session = this.getSession(sessionId);
        if (!session) {
            session = this.createSession(sessionId);
        }

        // Add user message to history
        const userMsg: Message = {
            role: 'user',
            content: userMessage,
            timestamp: new Date(),
        };
        session.conversationHistory.push(userMsg);

        // Find best matching node with confidence score
        const matchResult = this.findBestNodeWithScore(userMessage, session);
        let response: string;
        let usedFallback = false;

        // Check if confidence is too low and LLM fallback is available
        if (matchResult.score < this.confidenceThreshold && this.llmService.isEnabled()) {
            console.log(`[LLM Fallback] Low confidence (${matchResult.score.toFixed(2)}), using LLM`);
            try {
                response = await this.llmService.generateResponse(
                    userMessage,
                    session.conversationHistory
                );
                usedFallback = true;
            } catch (error: any) {
                console.error('[LLM Fallback] Error:', error.message);
                console.log('[LLM Fallback] Falling back to default node');
                // Fallback to default node on LLM error
                response = this.selectResponse(matchResult.node, session);
            }
        } else {
            // Use JSON-based response
            // Update session state
            session.currentNode = matchResult.node.id;
            if (!session.visitedNodes.includes(matchResult.node.id)) {
                session.visitedNodes.push(matchResult.node.id);
            }

            // Update context
            this.updateContext(session, matchResult.node, userMessage);

            // Select appropriate response
            response = this.selectResponse(matchResult.node, session);
        }

        // Add bot response to history
        const botMsg: Message = {
            role: 'bot',
            content: response,
            timestamp: new Date(),
            nodeId: usedFallback ? 'llm-fallback' : matchResult.node.id,
            usedFallback,
        };
        session.conversationHistory.push(botMsg);

        this.sessions.set(sessionId, session);
        return response;
    }

    private findBestNodeWithScore(userMessage: string, session: ConversationState): MatchResult {
        const tokens = tokenizer.tokenize(userMessage.toLowerCase()) || [];
        let bestMatch: ConversationNode = this.data.nodes[this.data.nodes.length - 1]; // Start with default
        let bestScore = 0;

        this.data.nodes.forEach((node, index) => {
            let score = 0;

            // Check trigger phrases (high priority for exact/partial matches)
            if (node.triggers) {
                for (const trigger of node.triggers) {
                    const triggerLower = trigger.toLowerCase();
                    const messageLower = userMessage.toLowerCase();

                    // Exact match - very high score
                    if (messageLower.includes(triggerLower)) {
                        score += 20;
                    }
                    // Partial word match - medium score
                    else if (triggerLower.split(' ').some(word => messageLower.includes(word) && word.length > 3)) {
                        score += 10;
                    }
                }
            }

            // Improved keyword matching (bidirectional)
            if (node.keywords) {
                for (const keyword of node.keywords) {
                    const keywordLower = keyword.toLowerCase();

                    // Check if any user token matches the keyword
                    const tokenMatch = tokens.some(token =>
                        token.length > 2 && (
                            keywordLower.includes(token) ||
                            token.includes(keywordLower) ||
                            this.calculateSimilarity(token, keywordLower) > 0.7
                        )
                    );

                    if (tokenMatch) {
                        score += 7;
                    }
                }
            }

            // Check context relevance (stronger boost)
            if (node.context) {
                for (const contextKey of node.context) {
                    if (session.context.has(contextKey)) {
                        score += 5;
                    }
                }
            }

            // TF-IDF similarity score (increased weight)
            this.tfidf.tfidfs(userMessage, (i: number, measure: number) => {
                if (i === index && measure > 0) {
                    score += measure * 15; // Increased from 2 to 15
                }
            });

            // Boost score for next nodes (conversation flow)
            if (session.currentNode) {
                const currentNode = this.data.nodes.find(n => n.id === session.currentNode);
                if (currentNode?.nextNodes?.includes(node.id)) {
                    score += 6;
                }
            }

            // Priority multiplier
            if (node.priority) {
                score *= node.priority;
            }

            // Penalty for recently visited nodes (but not too harsh)
            if (session.visitedNodes.slice(-3).includes(node.id)) {
                score *= 0.7; // Changed from 0.5 to 0.7
            }

            // Avoid default node unless score is very low
            if (node.id === 'default' && score > 0) {
                score *= 0.1;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = node;
            }
        });

        // Log matching for debugging
        console.log(`[Match] "${userMessage}" -> ${bestMatch.id} (score: ${bestScore.toFixed(2)})`);

        return {
            node: bestMatch,
            score: bestScore,
            usedFallback: false,
        };
    }

    private findBestNode(userMessage: string, session: ConversationState): ConversationNode {
        const tokens = tokenizer.tokenize(userMessage.toLowerCase()) || [];
        let bestMatch: ConversationNode = this.data.nodes[this.data.nodes.length - 1]; // Start with default
        let bestScore = 0;

        this.data.nodes.forEach((node, index) => {
            let score = 0;

            // Check trigger phrases (high priority for exact/partial matches)
            if (node.triggers) {
                for (const trigger of node.triggers) {
                    const triggerLower = trigger.toLowerCase();
                    const messageLower = userMessage.toLowerCase();

                    // Exact match - very high score
                    if (messageLower.includes(triggerLower)) {
                        score += 20;
                    }
                    // Partial word match - medium score
                    else if (triggerLower.split(' ').some(word => messageLower.includes(word) && word.length > 3)) {
                        score += 10;
                    }
                }
            }

            // Improved keyword matching (bidirectional)
            if (node.keywords) {
                for (const keyword of node.keywords) {
                    const keywordLower = keyword.toLowerCase();

                    // Check if any user token matches the keyword
                    const tokenMatch = tokens.some(token =>
                        token.length > 2 && (
                            keywordLower.includes(token) ||
                            token.includes(keywordLower) ||
                            this.calculateSimilarity(token, keywordLower) > 0.7
                        )
                    );

                    if (tokenMatch) {
                        score += 7;
                    }
                }
            }

            // Check context relevance (stronger boost)
            if (node.context) {
                for (const contextKey of node.context) {
                    if (session.context.has(contextKey)) {
                        score += 5;
                    }
                }
            }

            // TF-IDF similarity score (increased weight)
            this.tfidf.tfidfs(userMessage, (i: number, measure: number) => {
                if (i === index && measure > 0) {
                    score += measure * 15; // Increased from 2 to 15
                }
            });

            // Boost score for next nodes (conversation flow)
            if (session.currentNode) {
                const currentNode = this.data.nodes.find(n => n.id === session.currentNode);
                if (currentNode?.nextNodes?.includes(node.id)) {
                    score += 6;
                }
            }

            // Priority multiplier
            if (node.priority) {
                score *= node.priority;
            }

            // Penalty for recently visited nodes (but not too harsh)
            if (session.visitedNodes.slice(-3).includes(node.id)) {
                score *= 0.7; // Changed from 0.5 to 0.7
            }

            // Avoid default node unless score is very low
            if (node.id === 'default' && score > 0) {
                score *= 0.1;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = node;
            }
        });

        // Log matching for debugging (optional)
        console.log(`Best match for "${userMessage}": ${bestMatch.id} (score: ${bestScore})`);

        return bestMatch;
    }

    // Simple string similarity using Levenshtein-like approach
    private calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) return 1.0;

        const editDistance = this.getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    private getEditDistance(str1: string, str2: string): number {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    private selectResponse(node: ConversationNode, session: ConversationState): string {
        // Select response based on conversation history and context
        const responses = node.responses;

        // Simple selection: avoid repeating recent responses
        const recentResponses = session.conversationHistory
            .filter(msg => msg.role === 'bot')
            .slice(-3)
            .map(msg => msg.content);

        const availableResponses = responses.filter(
            resp => !recentResponses.includes(resp)
        );

        const selectedResponses = availableResponses.length > 0
            ? availableResponses
            : responses;

        // Random selection from available responses
        return selectedResponses[Math.floor(Math.random() * selectedResponses.length)];
    }

    private updateContext(
        session: ConversationState,
        node: ConversationNode,
        userMessage: string
    ): void {
        // Update context based on the matched node
        if (node.context) {
            node.context.forEach(contextKey => {
                session.context.set(contextKey, true);
            });
        }

        // Track topics discussed
        const relatedTopic = this.data.topics.find(topic =>
            topic.nodes.includes(node.id)
        );
        if (relatedTopic && !session.topicsDiscussed.includes(relatedTopic.id)) {
            session.topicsDiscussed.push(relatedTopic.id);
        }

        // Store sentiment analysis
        const sentiment = this.analyzeSentiment(userMessage);
        session.context.set('lastSentiment', sentiment);
    }

    private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
        const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
        const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
        const score = analyzer.getSentiment(tokens);

        if (score > 0.2) return 'positive';
        if (score < -0.2) return 'negative';
        return 'neutral';
    }

    getConversationHistory(sessionId: string): Message[] {
        const session = this.getSession(sessionId);
        return session?.conversationHistory || [];
    }

    getTopicsDiscussed(sessionId: string): Topic[] {
        const session = this.getSession(sessionId);
        if (!session) return [];

        return this.data.topics.filter(topic =>
            session.topicsDiscussed.includes(topic.id)
        );
    }
}
