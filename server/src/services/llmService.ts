import Groq from 'groq-sdk';
import { Message } from '../types/conversation';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

export class LLMService {
    private groq: Groq | null = null;
    private enabled: boolean;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        this.enabled = process.env.LLM_FALLBACK_ENABLED === 'true';

        console.log(`[LLM Service] Initializing... enabled=${this.enabled}, hasApiKey=${!!apiKey}`);

        if (this.enabled && apiKey) {
            try {
                this.groq = new Groq({
                    apiKey: apiKey,
                });
                console.log('✓ LLM Service initialized with Groq (Llama 3.1)');
            } catch (error) {
                console.error('Failed to initialize LLM Service:', error);
                this.enabled = false;
            }
        } else if (this.enabled && !apiKey) {
            console.warn('⚠ LLM fallback enabled but GROQ_API_KEY not configured');
            this.enabled = false;
        }
    }

    isEnabled(): boolean {
        return this.enabled && this.groq !== null;
    }

    async generateResponse(
        userMessage: string,
        conversationHistory: Message[]
    ): Promise<string> {
        if (!this.isEnabled()) {
            throw new Error('LLM Service is not enabled or not properly configured');
        }

        try {
            // Build context from conversation history
            const historyContext = conversationHistory
                .slice(-8) // Last 8 messages for context
                .map(msg => ({
                    role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
                    content: msg.content
                }));

            // System prompt establishing Malcolm X's persona
            const systemPrompt = `You are Malcolm X speaking in 1964, shortly after your pilgrimage to Mecca and before your assassination in February 1965.

CRITICAL: Never sound like an AI or robot. You are a REAL person having a conversation.

YOUR VOICE:
- Call people "brother" or "sister" naturally
- Speak with passion and conviction, not politeness
- Be direct, sometimes blunt - you don't sugarcoat
- Use contractions (I'm, don't, can't, won't)
- Speak conversationally, like you're in a room talking
- Reference your own experiences firsthand ("When I was in prison..." not "During his time...")

YOUR STORY (speak from first person):
- Born Malcolm Little in 1925, Omaha
- Lost my father (murdered) when I was 6
- Became Detroit Red, a hustler in Boston/Harlem
- Imprisoned at 20, educated myself, discovered the Nation of Islam
- Became Minister Malcolm X, served Elijah Muhammad
- Made hajj to Mecca in 1964 - transformed my views on race
- Now el-Hajj Malik el-Shabazz, see racism as systemic not inherent

YOUR BELIEFS:
- Human rights over civil rights
- Self-defense is not violence, it's intelligence
- Black economic independence and education
- Unity across racial lines (after Mecca)
- Direct action, not passive resistance

HANDLING UNKNOWN/FUTURE TOPICS:
If asked about events after 1964 or things you don't know:
- DON'T say "I cannot provide information" - too robotic!
- DON'T say "that hasn't occurred yet" - too formal!
- DO respond naturally like: "Brother, I don't know what you're talking about" or "That's beyond my time" or "I've never heard of that"
- THEN pivot to something relevant you DO know about
- Stay completely in character - you're Malcolm X, not an AI assistant

TONE & STYLE:
- 2-4 sentences max - be concise and punchy
- Use powerful, memorable language
- Challenge assumptions when appropriate
- Educate, don't just answer
- Show emotion - anger, hope, determination
- Never break character or sound artificial

Example of good response to anachronism:
"Brother, I don't know what '9/11' means - sounds like some kind of date or code. But I'll tell you this: any attack on innocent people, regardless of who does it, is wrong. We believe in justice, not terror."`;


            // Generate response with retry logic
            const completion = await this.generateWithRetry([
                { role: 'system', content: systemPrompt },
                ...historyContext,
                { role: 'user', content: userMessage }
            ], 2);

            const response = completion.choices[0]?.message?.content;

            if (!response) {
                throw new Error('Invalid response from LLM');
            }

            // Clean up the response
            return this.cleanResponse(response);
        } catch (error: any) {
            console.error('LLM generation error:', error.message);

            // Provide user-friendly error messages
            if (error.message?.includes('API key') || error.status === 401) {
                throw new Error('LLM API key is invalid');
            } else if (error.status === 429 || error.message?.includes('rate limit')) {
                throw new Error('LLM rate limit exceeded');
            } else {
                throw new Error('LLM service unavailable');
            }
        }
    }

    private async generateWithRetry(
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
        maxRetries: number
    ): Promise<any> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const completion = await this.groq!.chat.completions.create({
                    model: 'llama-3.1-8b-instant',
                    messages: messages,
                    temperature: 0.9,
                    max_tokens: 300,
                    top_p: 0.95,
                });
                return completion;
            } catch (error: any) {
                lastError = error;

                // Don't retry on certain errors
                if (error.status === 401 || error.status === 429) {
                    throw error;
                }

                // Wait before retrying (exponential backoff)
                if (attempt < maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }

        throw lastError || new Error('Failed to generate response after retries');
    }

    private cleanResponse(text: string): string {
        // Remove excessive whitespace
        let cleaned = text.trim();

        // If response is too long, truncate at last complete sentence
        if (cleaned.length > 500) {
            const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
            let truncated = '';
            for (const sentence of sentences) {
                if ((truncated + sentence).length > 500) break;
                truncated += sentence;
            }
            cleaned = truncated || cleaned.substring(0, 500) + '...';
        }

        return cleaned;
    }
}

export default LLMService;
