import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      {message}
    </div>
  );
};

export default LoadingSpinner;