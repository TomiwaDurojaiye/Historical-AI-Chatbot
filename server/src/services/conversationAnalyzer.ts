import natural from 'natural';
import { Message } from '../types/conversation';

const tokenizer = new natural.WordTokenizer();
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

/**
 * Intent classification types
 */
export type UserIntent =
    | 'biographical_question'
    | 'philosophical_question'
    | 'opinion_request'
    | 'challenge_view'
    | 'seeking_dialogue'
    | 'general_greeting'
    | 'clarification';

/**
 * Emotional tone of user message
 */
export type EmotionalTone =
    | 'respectful'
    | 'curious'
    | 'skeptical'
    | 'confrontational'
    | 'enthusiastic'
    | 'neutral';

/**
 * Complexity level of user question
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex';

/**
 * Full analysis result
 */
export interface ConversationAnalysis {
    intent: UserIntent;
    emotionalTone: EmotionalTone;
    complexity: ComplexityLevel;
    isChallenge: boolean;
    requiresSpecialHandling: boolean;
    sentimentScore: number;
    keyTopics: string[];
    contextualDepth: number;  // How deep into the conversation (0-1)
}

/**
 * ConversationAnalyzer - Analyzes user input for server-side decision making
 * 
 * This is core SERVER-SIDE LOGIC that examines user messages to determine:
 * - What the user is really asking for
 * - How complex their question is
 * - What emotional tone they're using
 * - Whether they're challenging Malcolm X's views
 * 
 * These decisions inform how the server routes and shapes responses.
 */
export class ConversationAnalyzer {
    /**
     * Performs complete analysis of user message
     * SERVER-SIDE DECISION: Classifies and categorizes user input
     */
    public analyze(
        message: string,
        conversationHistory: Message[]
    ): ConversationAnalysis {
        const intent = this.classifyIntent(message);
        const emotionalTone = this.detectEmotionalTone(message);
        const complexity = this.assessComplexity(message, conversationHistory);
        const isChallenge = this.identifyChallenge(message);
        const sentimentScore = this.analyzeSentiment(message);
        const keyTopics = this.extractKeyTopics(message);
        const contextualDepth = this.calculateContextualDepth(conversationHistory);

        // SERVER DECISION: Determine if special handling needed
        const requiresSpecialHandling = this.needsSpecialHandling(
            intent,
            emotionalTone,
            complexity,
            isChallenge
        );

        return {
            intent,
            emotionalTone,
            complexity,
            isChallenge,
            requiresSpecialHandling,
            sentimentScore,
            keyTopics,
            contextualDepth,
        };
    }

    /**
     * Classifies user's intent
     * SERVER-SIDE LOGIC: Determines what type of response is needed
     */
    public classifyIntent(message: string): UserIntent {
        const messageLower = message.toLowerCase();
        const tokens = tokenizer.tokenize(messageLower) || [];

        // Greeting detection
        if (this.isGreeting(messageLower, tokens)) {
            return 'general_greeting';
        }

        // Biographical question detection
        if (this.isBiographicalQuestion(messageLower, tokens)) {
            return 'biographical_question';
        }

        // Philosophical question detection
        if (this.isPhilosophicalQuestion(messageLower, tokens)) {
            return 'philosophical_question';
        }

        // Opinion request detection
        if (this.isOpinionRequest(messageLower, tokens)) {
            return 'opinion_request';
        }

        // Challenge detection  
        if (this.isChallenge(messageLower, tokens)) {
            return 'challenge_view';
        }

        // Clarification request
        if (this.isClarificationRequest(messageLower, tokens)) {
            return 'clarification';
        }

        // Default to seeking dialogue
        return 'seeking_dialogue';
    }

    /**
     * Detects emotional tone of message
     * SERVER-SIDE LOGIC: Determines user's emotional approach
     */
    public detectEmotionalTone(message: string): EmotionalTone {
        const messageLower = message.toLowerCase();
        const sentimentScore = this.analyzeSentiment(message);

        // Check for confrontational language
        const confrontationalPhrases = [
            'you\'re wrong', 'that\'s stupid', 'i disagree', 'you don\'t understand',
            'that doesn\'t make sense', 'how dare you', 'that\'s ridiculous'
        ];
        if (confrontationalPhrases.some(phrase => messageLower.includes(phrase))) {
            return 'confrontational';
        }

        // Check for skeptical language
        const skepticalPhrases = [
            'but what about', 'are you sure', 'really?', 'i doubt',
            'how can you', 'that seems', 'questionable'
        ];
        if (skepticalPhrases.some(phrase => messageLower.includes(phrase))) {
            return 'skeptical';
        }

        // Check for enthusiastic language
        const enthusiasticPhrases = [
            'amazing', 'incredible', 'wow', 'fascinating', 'i love',
            'thank you', 'brilliant', 'exactly'
        ];
        if (enthusiasticPhrases.some(phrase => messageLower.includes(phrase))) {
            return 'enthusiastic';
        }

        // Check for respectful language
        const respectfulPhrases = [
            'please', 'could you', 'would you', 'thank you',
            'i appreciate', 'help me understand', 'i\'d like to know'
        ];
        if (respectfulPhrases.some(phrase => messageLower.includes(phrase))) {
            return 'respectful';
        }

        // Check for curious language
        const curiousPhrases = [
            'why', 'how', 'what', 'when', 'tell me more',
            'can you explain', 'i want to understand', 'i\'m curious'
        ];
        if (curiousPhrases.some(phrase => messageLower.includes(phrase))) {
            return 'curious';
        }

        return 'neutral';
    }

    /**
     * Assesses complexity of user question
     * SERVER-SIDE LOGIC: Determines depth of response needed
     */
    public assessComplexity(
        message: string,
        conversationHistory: Message[]
    ): ComplexityLevel {
        const tokens = tokenizer.tokenize(message.toLowerCase()) || [];
        let complexityScore = 0;

        // Factor 1: Message length and structure
        if (tokens.length > 20) complexityScore += 2;
        else if (tokens.length > 10) complexityScore += 1;

        // Factor 2: Multiple questions
        const questionCount = (message.match(/\?/g) || []).length;
        if (questionCount > 1) complexityScore += 2;

        // Factor 3: Advanced vocabulary
        const advancedTerms = [
            'philosophy', 'ideology', 'systemic', 'structural',
            'dialectic', 'paradigm', 'dichotomy', 'epistemology',
            'socioeconomic', 'geopolitical', 'metaphysical'
        ];
        const hasAdvancedTerms = advancedTerms.some(term =>
            message.toLowerCase().includes(term)
        );
        if (hasAdvancedTerms) complexityScore += 2;

        // Factor 4: References to multiple topics
        const topicKeywords = this.extractKeyTopics(message);
        if (topicKeywords.length > 2) complexityScore += 1;

        // Factor 5: Conversation depth
        if (conversationHistory.length > 10) complexityScore += 1;

        // SERVER DECISION: Classify based on score
        if (complexityScore >= 5) return 'complex';
        if (complexityScore >= 2) return 'moderate';
        return 'simple';
    }

    /**
     * Identifies if user is challenging Malcolm X's views
     * SERVER-SIDE LOGIC: Determines if robust defense needed
     */
    public identifyChallenge(message: string): boolean {
        const messageLower = message.toLowerCase();

        const challengePatterns = [
            'but what about', 'you\'re wrong', 'i disagree',
            'that doesn\'t make sense', 'why would you',
            'how can you say', 'that\'s not true',
            'you contradict', 'inconsistent', 'hypocritical'
        ];

        return challengePatterns.some(pattern =>
            messageLower.includes(pattern)
        );
    }

    /**
     * Extracts key topics from message
     * SERVER-SIDE ANALYSIS: Identifies what the message is about
     */
    private extractKeyTopics(message: string): string[] {
        const topics: string[] = [];
        const messageLower = message.toLowerCase();

        const topicMap: { [key: string]: string[] } = {
            'civil_rights': ['civil rights', 'martin luther king', 'mlk', 'nonviolence', 'integration'],
            'nation_of_islam': ['nation of islam', 'noi', 'elijah muhammad', 'muslim'],
            'philosophy': ['philosophy', 'beliefs', 'by any means', 'freedom', 'justice'],
            'self_defense': ['self-defense', 'violence', 'armed', 'protect', 'guns'],
            'education': ['education', 'learning', 'books', 'knowledge', 'reading'],
            'africa': ['africa', 'pan-africanism', 'african', 'colonial'],
            'mecca': ['mecca', 'hajj', 'pilgrimage', 'transformation'],
            'family': ['family', 'father', 'mother', 'wife', 'children'],
            'racism': ['racism', 'white supremacy', 'oppression', 'discrimination'],
            'economics': ['economics', 'business', 'wealth', 'money', 'economic'],
        };

        for (const [topic, keywords] of Object.entries(topicMap)) {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                topics.push(topic);
            }
        }

        return topics;
    }

    /**
     * Calculates how deep into the conversation we are
     * SERVER-SIDE METRIC: Used to adjust response depth
     */
    private calculateContextualDepth(conversationHistory: Message[]): number {
        // 0 = just started, 1 = deep conversation
        const messageCount = conversationHistory.length;

        if (messageCount === 0) return 0;
        if (messageCount >= 20) return 1.0;

        return Math.min(messageCount / 20, 1.0);
    }

    /**
     * Analyzes sentiment of message
     */
    private analyzeSentiment(message: string): number {
        const tokens = tokenizer.tokenize(message.toLowerCase()) || [];
        return analyzer.getSentiment(tokens);
    }

    /**
     * Determines if special handling is needed
     * SERVER-SIDE DECISION: Critical routing logic
     */
    private needsSpecialHandling(
        intent: UserIntent,
        tone: EmotionalTone,
        complexity: ComplexityLevel,
        isChallenge: boolean
    ): boolean {
        // SERVER DECISION: Complex questions need special care
        if (complexity === 'complex') return true;

        // SERVER DECISION: Challenges need thoughtful responses
        if (isChallenge) return true;

        // SERVER DECISION: Confrontational tone needs measured response
        if (tone === 'confrontational') return true;

        // SERVER DECISION: Philosophical questions deserve depth
        if (intent === 'philosophical_question') return true;

        return false;
    }

    // Helper methods for intent classification

    private isGreeting(messageLower: string, tokens: string[]): boolean {
        const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon'];
        return greetings.some(g => messageLower.includes(g)) && tokens.length < 10;
    }

    private isBiographicalQuestion(messageLower: string, tokens: string[]): boolean {
        const bioKeywords = [
            'life', 'born', 'childhood', 'grew up', 'family',
            'father', 'mother', 'prison', 'early years', 'background',
            'who are you', 'tell me about yourself', 'your story'
        ];
        return bioKeywords.some(k => messageLower.includes(k));
    }

    private isPhilosophicalQuestion(messageLower: string, tokens: string[]): boolean {
        const philoKeywords = [
            'philosophy', 'believe', 'think about', 'view on',
            'opinion', 'stance', 'position', 'why do you',
            'what do you think', 'how do you feel', 'by any means'
        ];
        return philoKeywords.some(k => messageLower.includes(k));
    }

    private isOpinionRequest(messageLower: string, tokens: string[]): boolean {
        const opinionPhrases = [
            'what do you think about', 'your thoughts on',
            'what about', 'how do you feel about',
            'what\'s your view', 'what\'s your opinion'
        ];
        return opinionPhrases.some(p => messageLower.includes(p));
    }

    private isChallenge(messageLower: string, tokens: string[]): boolean {
        return this.identifyChallenge(messageLower);
    }

    private isClarificationRequest(messageLower: string, tokens: string[]): boolean {
        const clarificationPhrases = [
            'what do you mean', 'can you clarify', 'i don\'t understand',
            'explain', 'could you elaborate', 'tell me more about',
            'what did you mean by'
        ];
        return clarificationPhrases.some(p => messageLower.includes(p));
    }
}

export default ConversationAnalyzer;
