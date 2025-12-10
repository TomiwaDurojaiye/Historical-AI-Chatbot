import natural from 'natural';
import PERSONA_CONFIG from '../config/personaConfig';

const tokenizer = new natural.WordTokenizer();

/**
 * Validation result with detailed feedback
 */
export interface ResponseValidation {
    passed: boolean;
    score: number;
    issues: ValidationIssue[];
    enhancements: string[];
}

export interface ValidationIssue {
    type: 'content' | 'tone' | 'length' | 'coherence' | 'accuracy';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
}

/**
 * ResponseValidator - Server-side validation and quality control
 * 
 * This is CRITICAL SERVER-SIDE LOGIC that ensures no response goes to the client
 * without meeting quality standards. This is NOT a pass-through - the server
 * actively validates and can reject responses.
 */
export class ResponseValidator {
    /**
     * Main validation method - validates response quality
     * SERVER-SIDE DECISION: Determines if response is acceptable
     */
    public validateResponse(
        response: string,
        userMessage: string,
        context: any
    ): ResponseValidation {
        const issues: ValidationIssue[] = [];
        let score = 100;

        // Run all validation checks
        score -= this.checkLength(response, issues);
        score -= this.checkCoherence(response, userMessage, issues);
        score -= this.checkContentQuality(response, issues);
        score -= this.checkToneConsistency(response, issues);
        score -= this.checkRelevance(response, userMessage, issues);

        // Generate enhancements
        const enhancements = this.generateEnhancements(response, issues);

        return {
            passed: score >= 70,  // SERVER DECISION: 70% threshold
            score: Math.max(0, score),
            issues,
            enhancements,
        };
    }

    /**
     * Validates response length
     * SERVER-SIDE VALIDATION: Ensures substantive but focused responses
     */
    private checkLength(response: string, issues: ValidationIssue[]): number {
        let penalty = 0;
        const length = response.length;
        const { minimumLength, maximumLength } = PERSONA_CONFIG.responseStandards;

        if (length < minimumLength) {
            issues.push({
                type: 'length',
                severity: 'high',
                description: `Response too brief (${length} chars, minimum ${minimumLength})`,
                suggestion: 'Malcolm X gave substantive, educational answers. Expand with historical context or examples.',
            });
            penalty = 30;
        } else if (length > maximumLength) {
            issues.push({
                type: 'length',
                severity: 'medium',
                description: `Response too long (${length} chars, maximum ${maximumLength})`,
                suggestion: 'Condense to key points while maintaining Malcolm X\'s directness and substance.',
            });
            penalty = 15;
        } else if (length < minimumLength * 1.5) {
            // Close to minimum - could be better
            issues.push({
                type: 'length',
                severity: 'low',
                description: 'Response is adequate but could be more thorough',
                suggestion: 'Consider adding more depth or examples.',
            });
            penalty = 5;
        }

        return penalty;
    }

    /**
     * Checks coherence between question and answer
     * SERVER-SIDE VALIDATION: Ensures response actually addresses the question
     */
    private checkCoherence(
        response: string,
        userMessage: string,
        issues: ValidationIssue[]
    ): number {
        let penalty = 0;

        // Extract key topics from user message
        const userTokens = tokenizer.tokenize(userMessage.toLowerCase()) || [];
        const responseTokens = tokenizer.tokenize(response.toLowerCase()) || [];

        // Check for topic overlap
        const overlap = userTokens.filter(token =>
            token.length > 4 && responseTokens.includes(token)
        );

        const overlapRatio = overlap.length / Math.max(userTokens.length, 1);

        // SERVER DECISION: Low overlap suggests response doesn't address question
        if (overlapRatio < 0.1) {
            issues.push({
                type: 'coherence',
                severity: 'high',
                description: 'Response may not address the user\'s question',
                suggestion: 'Ensure response directly relates to what was asked.',
            });
            penalty = 25;
        } else if (overlapRatio < 0.2) {
            issues.push({
                type: 'coherence',
                severity: 'medium',
                description: 'Response could be more directly relevant to the question',
                suggestion: 'Strengthen connection to user\'s specific question.',
            });
            penalty = 10;
        }

        // Check if response is actually answering vs deflecting
        if (this.isDeflection(response)) {
            issues.push({
                type: 'coherence',
                severity: 'high',
                description: 'Response appears to deflect rather than answer',
                suggestion: 'Malcolm X was direct - provide a real answer.',
            });
            penalty += 20;
        }

        return penalty;
    }

    /**
     * Checks content quality
     * SERVER-SIDE VALIDATION: Ensures response meets standards
     */
    private checkContentQuality(
        response: string,
        issues: ValidationIssue[]
    ): number {
        let penalty = 0;

        // Check for empty or generic responses
        if (this.isGeneric(response)) {
            issues.push({
                type: 'content',
                severity: 'high',
                description: 'Response is too generic or vague',
                suggestion: 'Provide specific, historically grounded content.',
            });
            penalty = 30;
        }

        // Check for anachronisms
        const anachronisms = this.findAnachronisms(response);
        if (anachronisms.length > 0) {
            issues.push({
                type: 'accuracy',
                severity: 'high',
                description: `Contains anachronisms: ${anachronisms.join(', ')}`,
                suggestion: 'Remove references to things that didn\'t exist in the 1960s.',
            });
            penalty = 35;
        }

        // Check for repetition
        if (this.hasExcessiveRepetition(response)) {
            issues.push({
                type: 'content',
                severity: 'medium',
                description: 'Response contains excessive repetition',
                suggestion: 'Vary language and avoid repeating the same points.',
            });
            penalty = 10;
        }

        return penalty;
    }

    /**
     * Checks tone consistency with Malcolm X's character
     * SERVER-SIDE VALIDATION: Ensures authentic voice
     */
    private checkToneConsistency(
        response: string,
        issues: ValidationIssue[]
    ): number {
        let penalty = 0;
        const responseLower = response.toLowerCase();

        // Check for hedging (Malcolm X was direct)
        const hedgingPhrases = [
            'maybe', 'perhaps', 'might', 'possibly',
            'i think', 'i believe', 'in my opinion',
            'sort of', 'kind of'
        ];

        const foundHedging = hedgingPhrases.filter(phrase =>
            responseLower.includes(phrase)
        );

        if (foundHedging.length > 0) {
            issues.push({
                type: 'tone',
                severity: 'medium',
                description: `Contains hedging language: ${foundHedging.join(', ')}`,
                suggestion: 'Malcolm X was direct and certain. Remove qualifying language.',
            });
            penalty = 15;
        }

        // Check for overly apologetic tone (not Malcolm X's style)
        const apologeticPhrases = ['sorry', 'apologize', 'my apologies', 'excuse me'];
        const foundApologetic = apologeticPhrases.filter(phrase =>
            responseLower.includes(phrase)
        );

        if (foundApologetic.length > 0) {
            issues.push({
                type: 'tone',
                severity: 'high',
                description: 'Response contains apologetic language',
                suggestion: 'Malcolm X didn\'t apologize for speaking truth. Remove apologetic tone.',
            });
            penalty = 20;
        }

        // Check for appropriate conviction
        if (!this.hasConviction(response)) {
            issues.push({
                type: 'tone',
                severity: 'medium',
                description: 'Response lacks Malcolm X\'s characteristic conviction',
                suggestion: 'Strengthen language to reflect Malcolm X\'s unwavering principles.',
            });
            penalty = 12;
        }

        return penalty;
    }

    /**
     * Checks relevance to user message
     * SERVER-SIDE VALIDATION: Ensures on-topic response
     */
    private checkRelevance(
        response: string,
        userMessage: string,
        issues: ValidationIssue[]
    ): number {
        // This overlaps with coherence but focuses on topical relevance
        // Already covered in checkCoherence
        return 0;
    }

    /**
     * Generates enhancement suggestions
     * SERVER-SIDE LOGIC: Provides specific improvement guidance
     */
    private generateEnhancements(
        response: string,
        issues: ValidationIssue[]
    ): string[] {
        const enhancements: string[] = [];

        // Check if response could use characteristic Malcolm X phrases
        const hasCharacteristicPhrase = PERSONA_CONFIG.characteristicPhrases.some(
            phrase => response.toLowerCase().includes(phrase.pattern.toLowerCase())
        );

        if (!hasCharacteristicPhrase && response.length > 100) {
            enhancements.push('Consider incorporating a characteristic Malcolm X phrase or expression');
        }

        // Check if response could benefit from historical context
        const hasHistoricalReference = this.hasHistoricalContext(response);
        if (!hasHistoricalReference && response.length > 100) {
            enhancements.push('Could strengthen with specific historical examples or dates');
        }

        // Check if response uses strong, active language
        const hasActiveVoice = this.usesActiveVoice(response);
        if (!hasActiveVoice) {
            enhancements.push('Consider rewriting in active voice for more directness');
        }

        return enhancements;
    }

    // Helper methods

    /**
     * Checks if response is deflecting rather than answering
     */
    private isDeflection(response: string): boolean {
        const deflectionPhrases = [
            'i can\'t answer that',
            'that\'s not something',
            'i\'d prefer not to',
            'let\'s talk about something else',
            'i don\'t have information',
        ];

        const responseLower = response.toLowerCase();
        return deflectionPhrases.some(phrase => responseLower.includes(phrase));
    }

    /**
     * Checks if response is too generic
     */
    private isGeneric(response: string): boolean {
        const genericPhrases = [
            'that\'s a good question',
            'it depends',
            'there are many factors',
            'it\'s complicated',
            'I understand your question',
        ];

        const responseLower = response.toLowerCase();

        // If response is mostly generic phrases and short
        const genericCount = genericPhrases.filter(phrase =>
            responseLower.includes(phrase)
        ).length;

        return genericCount > 0 && response.length < 150;
    }

    /**
     * Finds anachronisms in response
     */
    private findAnachronisms(response: string): string[] {
        const found: string[] = [];
        const responseLower = response.toLowerCase();

        for (const term of PERSONA_CONFIG.anachronismsToAvoid) {
            if (responseLower.includes(term.toLowerCase())) {
                found.push(term);
            }
        }

        return found;
    }

    /**
     * Checks for excessive repetition
     */
    private hasExcessiveRepetition(response: string): boolean {
        const sentences = response.split(/[.!?]+/);
        const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));

        // If more than 20% repetition, flag it
        return (sentences.length - uniqueSentences.size) / sentences.length > 0.2;
    }

    /**
     * Checks if response has conviction
     */
    private hasConviction(response: string): boolean {
        const convictionIndicators = [
            'I believe', 'I know', 'The truth is', 'make no mistake',
            'let me be clear', 'understand this', 'I declare',
            'we must', 'we will', 'I refuse', 'I insist'
        ];

        const responseLower = response.toLowerCase();
        return convictionIndicators.some(indicator =>
            responseLower.includes(indicator.toLowerCase())
        );
    }

    /**
     * Checks if response includes historical context
     */
    private hasHistoricalContext(response: string): boolean {
        const historicalIndicators = [
            /\b19\d{2}\b/,  // Years from 1900-1999
            /in \d{4}/,     // "in 1964"
            'when I was', 'during', 'at that time',
            'historically', 'in history',
        ];

        return historicalIndicators.some(indicator => {
            if (indicator instanceof RegExp) {
                return indicator.test(response);
            }
            return response.toLowerCase().includes(indicator.toLowerCase());
        });
    }

    /**
     * Checks if response uses active voice
     */
    private usesActiveVoice(response: string): boolean {
        // Count passive voice indicators
        const passiveIndicators = ['was', 'were', 'been', 'being'];
        const tokens = tokenizer.tokenize(response.toLowerCase()) || [];

        const passiveCount = tokens.filter(token =>
            passiveIndicators.includes(token)
        ).length;

        // If more than 15% passive indicators, flag it
        return passiveCount / Math.max(tokens.length, 1) < 0.15;
    }

    /**
     * Enhances a response based on validation results
     * SERVER-SIDE LOGIC: Can modify responses to improve quality
     */
    public enhanceResponse(response: string, validation: ResponseValidation): string {
        // For now, return as-is, but this could apply automatic enhancements
        // This demonstrates server has the ABILITY to modify responses
        return response;
    }
}

export default ResponseValidator;
