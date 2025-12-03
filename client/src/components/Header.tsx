import React from 'react';

interface HeaderProps {
    onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
    return (
        <header className="header">
            <div className="container header-content">
                <div className="header-title">
                    <div className="header-icon" aria-hidden="true">
                        ✊
                    </div>
                    <div>
                        <h1>Malcolm X</h1>
                        <p className="header-subtitle">Historical AI Chatbot Experience</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onReset}
                        aria-label="Reset conversation"
                    >
                        🔄 Reset
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
