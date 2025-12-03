import React from 'react';
import { Message as MessageType } from '../types/chat';

interface MessageBubbleProps {
    message: MessageType;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isBot = message.role === 'bot';
    const formattedTime = new Date(message.timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className={`message ${isBot ? 'message-bot' : 'message-user'}`}>
            <div className="message-avatar" aria-hidden="true">
                {isBot ? 'MX' : 'You'}
            </div>
            <div className="message-content">
                <div className="message-bubble">
                    {message.content}
                </div>
                <div className="message-time">{formattedTime}</div>
            </div>
        </div>
    );
};

export default MessageBubble;
