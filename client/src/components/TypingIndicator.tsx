import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="message message-bot">
            <div className="message-avatar" aria-hidden="true">
                MX
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TypingIndicator;
