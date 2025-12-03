import React from 'react';

interface ErrorStateProps {
    title: string;
    message: string;
    onRetry?: () => void;
    type?: 'error' | 'offline' | 'notFound';
}

const ErrorState: React.FC<ErrorStateProps> = ({ title, message, onRetry, type = 'error' }) => {
    const getIcon = () => {
        switch (type) {
            case 'offline':
                return (
                    <svg className="error-icon" viewBox="0 0 24 24" width="64" height="64">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                );
            case 'notFound':
                return (
                    <svg className="error-icon" viewBox="0 0 24 24" width="64" height="64">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
            default:
                return (
                    <svg className="error-icon" viewBox="0 0 24 24" width="64" height="64">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                );
        }
    };

    return (
        <div className="error-state">
            {getIcon()}
            <h2 className="error-title">{title}</h2>
            <p className="error-message">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="retry-button">
                    <svg viewBox="0 0 24 24" width="20" height="20" style={{ marginRight: '8px' }}>
                        <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorState;
