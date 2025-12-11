import React from 'react';
import { Message } from '../types/chat';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isBot = message.role === 'bot';
    const isRead = message.role === 'user'; // User messages are always "read" by Malcolm

    return (
        <div className={`message-wrapper ${isBot ? 'bot-message' : 'user-message'}`}>
            {isBot && (
                <div className="profile-picture">
                    <img src="/malcolm-x-profile.png" alt="Malcolm X" />
                </div>
            )}

            <div className="message-content-wrapper">
                <div className={`message-bubble ${message.role}-bubble`}>
                    <div className="message-text">{message.content}</div>
                </div>

                {!isBot && (
                    <div className="message-status">
                        {isRead ? (
                            <span className="read-receipt">
                                <svg viewBox="0 0 16 16" width="14" height="14">
                                    <path fill="#007AFF" d="M0,9 L1.4,7.6 L5,11.2 L14.6,1.6 L16,3 L5,14 L0,9 Z" />
                                    <path fill="#007AFF" d="M2,9 L3.4,7.6 L7,11.2 L16.6,1.6 L18,3 L7,14 L2,9 Z" transform="translate(-2, 0)" />
                                </svg>
                                <span className="status-text">Read</span>
                            </span>
                        ) : (
                            <span className="delivered-receipt">
                                <svg viewBox="0 0 16 16" width="14" height="14">
                                    <path fill="#8E8E93" d="M0,9 L1.4,7.6 L5,11.2 L14.6,1.6 L16,3 L5,14 L0,9 Z" />
                                </svg>
                                <span className="status-text">Delivered</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {isBot && <div className="message-spacer"></div>}
        </div>
    );
};

export default MessageBubble;
