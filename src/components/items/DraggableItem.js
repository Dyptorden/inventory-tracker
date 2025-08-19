import React, { useState, useEffect, useRef } from 'react';

const DraggableItem = ({ item, onModify, onDelete, onDragStart }) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef(null);
  const itemRef = useRef(null);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  // Handle Enter and Escape key presses for popup
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showOptions && (e.key === 'Enter' || e.key === 'Escape')) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showOptions]);

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

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="item-card"
      onClick={() => setShowOptions(!showOptions)}
      style={{ zIndex: showOptions ? 10000 : 2 }}
    >
      <div>{item.serialNumber} -> {item.type}</div>
      {showOptions && (
        <div ref={optionsRef} style={getPopupStyle()}>
          <button className="option-button" onClick={handleModify}>
            Modify
          </button>
          <button className="option-button delete" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default DraggableItem;