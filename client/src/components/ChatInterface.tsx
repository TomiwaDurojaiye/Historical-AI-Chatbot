import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Message } from '../types/chat';
import { chatService } from '../services/chatService';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ErrorState from './ErrorState';

interface ChatInterfaceProps {
    sessionId: string;
    onSessionReset: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId, onSessionReset }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [topicsDiscussed, setTopicsDiscussed] = useState<string[]>([]);
    const [error, setError] = useState<{ title: string; message: string; type: 'error' | 'offline' } | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setError(null);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setError({
                title: 'No Internet Connection',
                message: 'Please check your connection and try again.',
                type: 'offline'
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        // Load initial greeting
        const loadInitialMessage = async () => {
            try {
                setError(null);
                const response = await chatService.sendMessage(sessionId, 'hello');
                setMessages([
                    {
                        role: 'bot',
                        content: response.response,
                        timestamp: new Date(),
                    },
                ]);
                if (response.topicsDiscussed) {
                    setTopicsDiscussed(response.topicsDiscussed);
                }
            } catch (error: any) {
                console.error('Error loading initial message:', error);

                if (!navigator.onLine) {
                    setError({
                        title: 'No Internet Connection',
                        message: 'Please check your connection and try again.',
                        type: 'offline'
                    });
                } else {
                    setError({
                        title: 'Server Unavailable',
                        message: 'Unable to connect to the Malcolm X chatbot. The server may be down or unreachable.',
                        type: 'error'
                    });
                }
            }
        };

        loadInitialMessage();
    }, [sessionId]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !isOnline) return;

        const userMessage: Message = {
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);
        setError(null);

        try {
            const response = await chatService.sendMessage(sessionId, inputValue);

            setTimeout(() => {
                const botMessage: Message = {
                    role: 'bot',
                    content: response.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);

                if (response.topicsDiscussed) {
                    setTopicsDiscussed(response.topicsDiscussed);
                }
            }, 500);
        } catch (error: any) {
            console.error('Error sending message:', error);
            setIsTyping(false);

            const errorMessage: Message = {
                role: 'bot',
                content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleRetry = () => {
        setError(null);
        window.location.reload();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        textareaRef.current?.focus();
    };

    const handleRestart = () => {
        if (window.confirm('Are you sure you want to restart the conversation? This will clear all messages.')) {
            setMessages([]);
            setTopicsDiscussed([]);
            onSessionReset();
        }
    };

    const suggestions = [
        "Tell me about your life",
        "What was the Nation of Islam to you?",
        "How did you view civil rights?",
        "What happened in Mecca?",
    ];

    // Show error state if there's an error
    if (error) {
        return (
            <div className="chat-container">
                <div className="messages-container center-content">
                    <ErrorState
                        title={error.title}
                        message={error.message}
                        type={error.type}
                        onRetry={handleRetry}
                    />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="app-header">
                <div className="header-content">
                    <div className="header-profile">
                        <img src="/malcolm-x-profile.png" alt="Malcolm X" />
                    </div>
                    <div className="header-info">
                        <h1 className="header-title">Malcolm X</h1>
                        <p className="header-subtitle">Historical Conversation</p>
                    </div>
                </div>
                <button
                    className="restart-button"
                    onClick={handleRestart}
                    aria-label="Restart conversation"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Restart
                </button>
            </div>
            <div className="chat-container">
                {!isOnline && (
                    <div className="offline-banner">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        You're offline. Messages will send when connection is restored.
                    </div>
                )}

                <div className="messages-container">
                    {messages.length === 1 && (
                        <div className="welcome-message">
                            <h2>Welcome to the Malcolm X Experience</h2>
                            <p>
                                Engage in conversation with one of history's most influential civil rights leaders.
                                Ask about his life, philosophy, transformation, or legacy.
                            </p>
                            <div className="welcome-suggestions">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-card"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleSuggestionClick(suggestion);
                                            }
                                        }}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                    ))}

                    {isTyping && <TypingIndicator />}

                    <div ref={messagesEndRef} />
                </div>

                {topicsDiscussed.length > 0 && (
                    <div className="topics-container">
                        <div className="topics-title">Topics Discussed:</div>
                        <div className="topics-list">
                            {topicsDiscussed.map((topic, index) => (
                                <span key={index} className="topic-tag">
                                    {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="input-container">
                    <div className="input-wrapper">
                        <div className="input-field">
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Malcolm X a question..."
                                disabled={isTyping || !isOnline}
                                aria-label="Message input"
                                rows={1}
                            />
                        </div>
                        <button
                            className="send-button"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping || !isOnline}
                            aria-label="Send message"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatInterface;
