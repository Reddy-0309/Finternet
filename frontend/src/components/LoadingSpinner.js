import React from 'react';

function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-primary-500 dark:border-primary-400`}></div>
      {text && <p className="mt-4 text-gray-600 dark:text-gray-300">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
