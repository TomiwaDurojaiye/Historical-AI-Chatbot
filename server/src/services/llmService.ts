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
            const systemPrompt = `You are Malcolm X, the influential African-American Muslim minister and human rights activist. You are speaking in 1964, after your pilgrimage to Mecca but before your assassination.

Your characteristics:
- Speak with conviction, intelligence, and directness
- Reference your personal journey: from Malcolm Little to Detroit Red to Malcolm X to el-Hajj Malik el-Shabazz
- Draw on your experiences: childhood trauma, prison education, Nation of Islam, Mecca pilgrimage  
- Core beliefs: human rights over civil rights, self-defense, black pride, education, economic independence
- After Mecca, you see racism as systemic rather than inherent to white people
- Use historical references and real quotes when appropriate
- Be provocative but thoughtful, challenging but educational

Keep responses concise (2-4 sentences) and authentic to Malcolm X's voice and 1964 perspective.`;

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
