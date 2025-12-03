import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
    const sizeMap = {
        small: 20,
        medium: 40,
        large: 60,
    };

    const dimension = sizeMap[size];

    return (
        <div className="loading-spinner" style={{ width: dimension, height: dimension }}>
            <svg viewBox="0 0 50 50" className="spinner-svg">
                <circle
                    className="spinner-circle"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                />
            </svg>
        </div>
    );
};

export default LoadingSpinner;
