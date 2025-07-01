import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: string;
  fullscreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message,
  size = '12', // Default size in relative units
  fullscreen = false,
}) => {
  // Convert size to number (strip 'px' if present)
  const sizeValue = typeof size === 'string' ? parseInt(size.replace(/px$/, ''), 10) || 12 : size;
  
  const spinnerElement = (
    <div 
      className="animate-spin rounded-full border-t-2 border-b-2 border-gray-900 dark:border-white"
      style={{ 
        height: `${sizeValue}px`, 
        width: `${sizeValue}px`,
        display: 'inline-block'
      }}
    ></div>
  );

  // Return just the spinner for inline use
  if (!fullscreen) {
    return spinnerElement;
  }
  
  // Return fullscreen overlay with spinner
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg text-center">
        {spinnerElement}
        {message && <p className="mt-3 text-gray-800 dark:text-white">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner; 