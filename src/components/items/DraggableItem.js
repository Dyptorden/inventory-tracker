import React, { useState, useEffect, useRef } from 'react';

const DraggableItem = ({
  item,
  onModify,
  onDelete,
  onDragStart,
  onHover,
  onHoverEnd,
  onRetrieve,
  onHistory
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const itemRef = useRef(null);

  const isAssigned = item.isAssigned;
  const isDraggable = !isAssigned;

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
        // End hover effect when options close
        if (isAssigned && onHoverEnd) {
          onHoverEnd();
        }
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions, isAssigned, onHoverEnd]);

  // Handle Enter and Escape key presses for popup
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showOptions && (e.key === 'Enter' || e.key === 'Escape')) {
        setShowOptions(false);
        // End hover effect when options close with keyboard
        if (isAssigned && onHoverEnd) {
          onHoverEnd();
        }
      }
    };

    if (showOptions) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showOptions, isAssigned, onHoverEnd]);

  // Calculate popup position relative to viewport
  const getPopupStyle = () => {
    if (!itemRef.current) return {};

    const rect = itemRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.top,
      left: rect.right - 120,
      zIndex: 99999,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      minWidth: '120px'
    };
  };

  const handleModify = (e) => {
    e.stopPropagation();
    onModify(item);
    setShowOptions(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(item.id);
    setShowOptions(false);
  };

  const handleHistory = (e) => {
    e.stopPropagation();
    // End hover effect when opening history
    if (isAssigned && onHoverEnd) {
      onHoverEnd();
    }
    onHistory(item.serialNumber);
    setShowOptions(false);
  };

  const handleRetrieve = (e) => {
    e.stopPropagation();
    // End hover effect when retrieving
    if (isAssigned && onHoverEnd) {
      onHoverEnd();
    }
    onRetrieve(item);
    setShowOptions(false);
  };

  const handleMouseEnter = () => {
    if (isAssigned && onHover) {
      onHover(item.id);
    }
  };

  const handleMouseLeave = () => {
    if (isAssigned && onHoverEnd) {
      onHoverEnd();
    }
  };

  const handleDragStart = (e) => {
    if (isDraggable) {
      onDragStart(e, item);
    } else {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={itemRef}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`item-card ${isAssigned ? 'assigned' : ''}`}
      onClick={() => setShowOptions(!showOptions)}
      style={{
        zIndex: showOptions ? 10000 : 2,
        cursor: isDraggable ? 'move' : 'pointer'
      }}
    >
      <div>{item.serialNumber} -> {item.type}</div>
      {isAssigned && (
        <div className="assigned-receiver-info">
          {item.receiverEmail}
        </div>
      )}
      {showOptions && (
        <div ref={optionsRef} style={getPopupStyle()}>
          {isAssigned ? (
            <>
              <button className="option-button history" onClick={handleHistory}>
                History
              </button>
              <button className="option-button retrieve" onClick={handleRetrieve}>
                Retrieve
              </button>
            </>
          ) : (
            <>
              <button className="option-button" onClick={handleModify}>
                Modify
              </button>
              <button className="option-button history" onClick={handleHistory}>
                History
              </button>
              <button className="option-button delete" onClick={handleDelete}>
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableItem;