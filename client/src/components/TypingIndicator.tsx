import React from 'react';

const TypingIndicator: React.FC = () => {
    return (
        <div className="message-wrapper bot-message typing-indicator-wrapper">
            <div className="profile-picture">
                <img src="/malcolm-x-profile.png" alt="Malcolm X" />
            </div>

            <div className="message-content-wrapper">
                <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                </div>
            </div>

            <div className="message-spacer"></div>
        </div>
    );
};

export default TypingIndicator;
