import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import { chatService } from './services/chatService';
import './styles/styles.css';

const App: React.FC = () => {
    const [sessionId, setSessionId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        initializeSession();
    }, []);

    const initializeSession = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await chatService.createSession();
            setSessionId(data.sessionId);
        } catch (error) {
            console.error('Failed to initialize session:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (sessionId && confirm('Are you sure you want to reset the conversation?')) {
            try {
                await chatService.resetConversation(sessionId);
                await initializeSession();
            } catch (error) {
                console.error('Failed to reset conversation:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="app">
                <Header onReset={handleReset} />
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text">Connecting to Malcolm X...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app">
                <Header onReset={handleReset} />
                <div className="loading-container">
                    <p className="error-text">{error}</p>
                    <button onClick={initializeSession} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Header onReset={handleReset} />
            <main className="container" style={{ flex: 1, display: 'flex', paddingTop: '0' }}>
                {sessionId && <ChatInterface sessionId={sessionId} onSessionReset={initializeSession} />}
            </main>
            <footer className="footer">
                <p>
                    Educational chatbot simulating Malcolm X. Responses are generated based on historical
                    research and should not be considered as direct quotes.
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    Built with React, TypeScript, and Express
                </p>
            </footer>
        </div>
    );
};

export default App;
