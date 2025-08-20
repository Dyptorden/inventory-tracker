import React, { useState, useEffect, useRef } from 'react';

const ReceiverCell = ({
  receiver,
  onItemDrop,
  onModify,
  onDelete,
  onItemRemove,
  isHighlighted = false
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const optionsRef = useRef(null);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const itemData = JSON.parse(e.dataTransfer.getData('text/plain'));
    onItemDrop(itemData, receiver.id);
  };

  const handleEmailClick = (e) => {
    e.stopPropagation();
    window.location.href = `mailto:${receiver.email}`;
  };

  const handleItemClick = (item) => (e) => {
    e.stopPropagation();
    onItemRemove(item, receiver.id);
  };

  const handleModify = (e) => {
    e.stopPropagation();
    onModify(receiver);
    setShowOptions(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(receiver.id);
    setShowOptions(false);
  };

  const sortedAssignedItems = receiver.assignedItems
    ? [...receiver.assignedItems].sort((a, b) => a.serialNumber.localeCompare(b.serialNumber))
    : [];

  const cardClassName = `receiver-card ${dragOver ? 'drag-over' : ''} ${isHighlighted ? 'highlighted' : ''}`;

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cardClassName}
      onClick={() => setShowOptions(!showOptions)}
    >
      <div className="receiver-name">
        {receiver.lastName} {receiver.firstName}{' '}
        <span
          className="receiver-email"
          onClick={handleEmailClick}
          title="Click to send email"
        >
          ({receiver.email})
        </span>
      </div>

      {sortedAssignedItems.map((item, index) => (
        <div
          key={index}
          className="assigned-item"
          onClick={handleItemClick(item)}
          title="Click to return item to inventory"
        >
          {item.serialNumber} -> {item.type}
        </div>
      ))}

      {dragOver && (!receiver.assignedItems || receiver.assignedItems.length === 0) && (
        <div className="drop-indicator">
          Drop item here
        </div>
      )}

      {showOptions && (
        <div className="options-menu" ref={optionsRef} style={{ zIndex: 99999 }}>
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

export default ReceiverCell;