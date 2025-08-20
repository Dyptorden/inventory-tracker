import React, { useState, useEffect } from 'react';
import { getItemHistory } from '../../services/firebaseService';

const HistoryModal = ({ isOpen, onClose, serialNumber }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load history when modal opens
  useEffect(() => {
    if (isOpen && serialNumber) {
      loadHistory();
    } else {
      // Reset state when modal closes
      setHistory([]);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, serialNumber]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await getItemHistory(serialNumber);
      setHistory(historyData);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history. Please try again.');
      setHistory([]); // Ensure we show empty state on error
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // Handle Firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const getOperationIcon = (operation) => {
    if (operation.includes('assigned to')) {
      return <span className="history-icon history-icon-assign">→</span>;
    } else if (operation.includes('retrieved from')) {
      return <span className="history-icon history-icon-retrieve">←</span>;
    } else if (operation.includes('updated from') || operation.includes('Type updated')) {
      return <span className="history-icon history-icon-modify">●</span>;
    }
    return null;
  };

  const handleClose = () => {
    onClose();
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isOpen && e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content history-modal-container">
        <div className="history-modal">
          <div className="modal-title">Item History</div>

          <div className="history-content">
            {/* Serial Number Header */}
            <div className="history-header">
              <strong>Serial Number: {serialNumber}</strong>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="history-loading">
                Loading history...
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="history-error">
                {error}
              </div>
            )}

            {/* History Entries */}
            {!loading && !error && (
              <div className="history-entries">
                {history.length === 0 ? (
                  <div className="history-empty">
                    No history records found for this item.
                  </div>
                ) : (
                  history.map((entry, index) => (
                    <div key={entry.id || index} className="history-entry">
                      <div className="history-row">
                        <div className="history-datetime">
                          {formatDateTime(entry.timestamp)}
                        </div>
                        {getOperationIcon(entry.operation)}
                        <div className="history-operation">
                          {entry.operation}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="history-actions">
            <button className="button button-primary history-close-btn" onClick={handleClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;