import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
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

    if (loading) {
        return (
            <div className="app-container">
                <div className="loading-container">
                    <LoadingSpinner size="large" />
                    <p className="loading-text" style={{ color: 'white', marginTop: '12px' }}>Connecting to Malcolm X...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-container">
                <div className="loading-container">
                    <p className="error-text" style={{ color: 'white', fontSize: '16px' }}>{error}</p>
                    <button onClick={initializeSession} className="send-button" style={{ marginTop: '20px' }}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            {sessionId && <ChatInterface sessionId={sessionId} onSessionReset={initializeSession} />}
        </div>
    );
};

export default App;
