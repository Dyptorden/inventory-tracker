import React from 'react';

const Instructions = () => {
  return (
    <div className="instructions">
      <h4>How to use:</h4>
      <ul>
        <li>• Drag items from left panel to receiver cards</li>
        <li>• Click assigned items to return them to inventory</li>
        <li>• Click items/receivers to modify or delete</li>
        <li>• Items auto-sort when returned to inventory</li>
      </ul>
      <div className="firebase-status">
        <strong>Firebase Connected:</strong>
        <p>
          Data is now synchronized in real-time across all users!
        </p>
      </div>
    </div>
  );
};

export default Instructions;