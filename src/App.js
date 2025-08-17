import React, { useState, useEffect, useRef } from 'react';

// Mock database for demonstration (replace with actual Firebase in production)
let mockDatabase = {
  items: [],
  receivers: [],
  nextId: 1
};

// Component for draggable items
const DraggableItem = ({ item, onModify, onDelete, onDragStart, itemIndex, totalItems }) => {
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
      position: 'fixed', // Use fixed to escape overflow clipping
      top: rect.top, // Align with item's top
      left: rect.right - 120, // Align with item's right edge, accounting for popup width
      zIndex: 99999,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      minWidth: '120px'
    };
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
      <div>{item.serialNumber}_{item.type}</div>
      {showOptions && (
        <div ref={optionsRef} style={getPopupStyle()}>
          <button
            className="option-button"
            onClick={(e) => {
              e.stopPropagation();
              onModify(item);
              setShowOptions(false);
            }}
          >
            Modify
          </button>
          <button
            className="option-button delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
              setShowOptions(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Component for receiver cells
const ReceiverCell = ({ receiver, onItemDrop, onModify, onDelete, onItemRemove }) => {
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
    // Only trigger drag leave if we're actually leaving the receiver card
    // Check if the related target is not a child of the current target
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

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`receiver-card ${dragOver ? 'drag-over' : ''}`}
      onClick={() => setShowOptions(!showOptions)}
    >
      <div className="receiver-name">
        {receiver.lastName} {receiver.firstName}{' '}
        <span
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `mailto:${receiver.email}`;
          }}
          title="Click to send email"
        >
          ({receiver.email})
        </span>
      </div>

      {receiver.assignedItems &&
        [...receiver.assignedItems]
          .sort((a, b) => a.serialNumber.localeCompare(b.serialNumber))
          .map((item, index) => (
        <div
          key={index}
          className="assigned-item"
          onClick={(e) => {
            e.stopPropagation();
            onItemRemove(item, receiver.id);
          }}
          title="Click to return item to inventory"
        >
          {item.serialNumber}_{item.type}
        </div>
      ))}

      {dragOver && (!receiver.assignedItems || receiver.assignedItems.length === 0) && (
        <div className="drop-indicator">
          Drop item here
        </div>
      )}

      {showOptions && (
        <div className="options-menu" ref={optionsRef} style={{ zIndex: 99999 }}>
          <button
            className="option-button"
            onClick={(e) => {
              e.stopPropagation();
              onModify(receiver);
              setShowOptions(false);
            }}
          >
            Modify
          </button>
          <button
            className="option-button delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(receiver.id);
              setShowOptions(false);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

// Modal component
const Modal = ({ isOpen, onClose, children, autoFocus = false, onClosed }) => {
  const modalRef = useRef(null);

  // Auto-focus the modal when it opens (for error modals)
  useEffect(() => {
    if (isOpen && autoFocus && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen, autoFocus]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isOpen && autoFocus && (e.key === 'Enter' || e.key === 'Escape')) {
        handleClose();
      }
    };

    if (isOpen && autoFocus) {
      document.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, autoFocus]);

  // Handle modal closing with callback
  const handleClose = () => {
    onClose();
    if (onClosed) {
      // Small delay to ensure modal is closed before calling onClosed
      setTimeout(onClosed, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        ref={autoFocus ? modalRef : null}
        tabIndex={autoFocus ? -1 : undefined}
        style={{ outline: 'none' }}
      >
        {children}
      </div>
    </div>
  );
};

// Main App component
const InventoryTracker = () => {
  const [items, setItems] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showReceiverModal, setShowReceiverModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingReceiver, setEditingReceiver] = useState(null);
  const [sortBy, setSortBy] = useState('serial');
  const [sortReverse, setSortReverse] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '', returnFocus: null });

  // Form refs for focus management
  const serialNumberRef = useRef(null);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);

  // Form states
  const [itemForm, setItemForm] = useState({ serialNumber: '', type: 'HMI' });
  const [receiverForm, setReceiverForm] = useState({ firstName: '', lastName: '', email: '' });

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    let result;
    if (sortBy === 'serial') {
      result = a.serialNumber.localeCompare(b.serialNumber);
    } else {
      result = a.type.localeCompare(b.type);
    }
    return sortReverse ? -result : result;
  });

  // Show error modal with focus return capability
  const showError = (message, returnFocusRef = null) => {
    setErrorModal({ show: true, message, returnFocus: returnFocusRef });
  };
  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  // Handle sort button clicks
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      // If clicking the same sort button, reverse the order
      setSortReverse(!sortReverse);
    } else {
      // If clicking a different sort button, change sort type and reset reverse
      setSortBy(newSortBy);
      setSortReverse(false);
    }
  };

  // Handle drag start for items
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  // Add or update item
  const handleItemSubmit = () => {
    if (!itemForm.serialNumber.trim()) {
      showError('Serial number is required!', serialNumberRef);
      return;
    }

    // Check for unique serial number in items array
    const existingInItems = items.find(item =>
      item.serialNumber === itemForm.serialNumber &&
      (!editingItem || item.id !== editingItem.id)
    );

    // Check for unique serial number in assigned items across all receivers
    let assignedToReceiver = null;
    const existingInReceivers = receivers.some(receiver => {
      if (receiver.assignedItems && receiver.assignedItems.some(assignedItem =>
        assignedItem.serialNumber === itemForm.serialNumber
      )) {
        assignedToReceiver = receiver;
        return true;
      }
      return false;
    });

    // Generate specific error message based on where the duplicate was found
    if (existingInItems) {
      showError('There is already an item with that serial in the items list!', serialNumberRef);
      return;
    }

    if (existingInReceivers && assignedToReceiver) {
      showError(`There is already an item with that serial and it is assigned to ${assignedToReceiver.lastName} ${assignedToReceiver.firstName}!`, serialNumberRef);
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        const updatedItems = items.map(item =>
          item.id === editingItem.id
            ? { ...item, ...itemForm }
            : item
        );
        setItems(updatedItems);
        mockDatabase.items = updatedItems;
      } else {
        // Add new item
        const newItem = {
          id: mockDatabase.nextId++,
          ...itemForm
        };
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
        mockDatabase.items = updatedItems;
      }
      setShowItemModal(false);
      setItemForm({ serialNumber: '', type: 'HMI' });
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Add or update receiver
  const handleReceiverSubmit = () => {
    const errors = [];
    let firstErrorRef = null;

    // Validate all required fields
    if (!receiverForm.firstName.trim()) {
      errors.push('First name is required');
      if (!firstErrorRef) firstErrorRef = firstNameRef;
    }
    if (!receiverForm.lastName.trim()) {
      errors.push('Last name is required');
      if (!firstErrorRef) firstErrorRef = lastNameRef;
    }
    if (!receiverForm.email.trim()) {
      errors.push('Email is required');
      if (!firstErrorRef) firstErrorRef = emailRef;
    }

    // Validate email format if email is provided
    if (receiverForm.email.trim() && !isValidEmail(receiverForm.email)) {
      errors.push('Please enter a valid email address');
      if (!firstErrorRef) firstErrorRef = emailRef;
    }

    // Check for unique email if email is provided and valid
    if (receiverForm.email.trim() && isValidEmail(receiverForm.email)) {
      const existingReceiver = receivers.find(receiver =>
        receiver.email === receiverForm.email &&
        (!editingReceiver || receiver.id !== editingReceiver.id)
      );

      if (existingReceiver) {
        errors.push('Email must be unique');
        if (!firstErrorRef) firstErrorRef = emailRef;
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      const errorMessage = errors.length === 1
        ? errors[0] + '!'
        : 'Please fix the following errors:\n• ' + errors.join('\n• ');
      showError(errorMessage, firstErrorRef);
      return;
    }

    try {
      const receiverData = {
        ...receiverForm,
        assignedItems: editingReceiver?.assignedItems || []
      };

      if (editingReceiver) {
        // Update existing receiver
        const updatedReceivers = receivers.map(receiver =>
          receiver.id === editingReceiver.id
            ? { ...receiver, ...receiverData }
            : receiver
        );
        setReceivers(updatedReceivers);
        mockDatabase.receivers = updatedReceivers;
      } else {
        // Add new receiver
        const newReceiver = {
          id: mockDatabase.nextId++,
          ...receiverData
        };
        const updatedReceivers = [...receivers, newReceiver];
        setReceivers(updatedReceivers);
        mockDatabase.receivers = updatedReceivers;
      }
      setShowReceiverModal(false);
      setReceiverForm({ firstName: '', lastName: '', email: '' });
      setEditingReceiver(null);
    } catch (error) {
      console.error('Error saving receiver:', error);
    }
  };

  // Handle item drop on receiver
  const handleItemDrop = (item, receiverId) => {
    try {
      // Remove item from items list
      const updatedItems = items.filter(i => i.id !== item.id);
      setItems(updatedItems);
      mockDatabase.items = updatedItems;

      // Add item to receiver's assigned items
      const updatedReceivers = receivers.map(receiver => {
        if (receiver.id === receiverId) {
          return {
            ...receiver,
            assignedItems: [...(receiver.assignedItems || []), {
              serialNumber: item.serialNumber,
              type: item.type
            }]
          };
        }
        return receiver;
      });
      setReceivers(updatedReceivers);
      mockDatabase.receivers = updatedReceivers;
    } catch (error) {
      console.error('Error dropping item:', error);
    }
  };

  // Handle item removal from receiver back to items
  const handleItemRemove = (item, receiverId) => {
    try {
      // Add item back to items list
      const newItem = {
        id: mockDatabase.nextId++,
        serialNumber: item.serialNumber,
        type: item.type
      };
      const updatedItems = [...items, newItem].sort((a, b) => {
        let result;
        if (sortBy === 'serial') {
          result = a.serialNumber.localeCompare(b.serialNumber);
        } else {
          result = a.type.localeCompare(b.type);
        }
        return sortReverse ? -result : result;
      });
      setItems(updatedItems);
      mockDatabase.items = updatedItems;

      // Remove item from receiver's assigned items
      const updatedReceivers = receivers.map(receiver => {
        if (receiver.id === receiverId) {
          const updatedAssignedItems = receiver.assignedItems.filter(
            assignedItem => !(assignedItem.serialNumber === item.serialNumber && assignedItem.type === item.type)
          );
          return { ...receiver, assignedItems: updatedAssignedItems };
        }
        return receiver;
      });
      setReceivers(updatedReceivers);
      mockDatabase.receivers = updatedReceivers;
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Delete functions
  const handleDeleteItem = (itemId) => {
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      mockDatabase.items = updatedItems;
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDeleteReceiver = (receiverId) => {
    try {
      // First, return all assigned items to the items list
      const receiver = receivers.find(r => r.id === receiverId);
      if (receiver?.assignedItems) {
        const returnedItems = receiver.assignedItems.map(item => ({
          id: mockDatabase.nextId++,
          serialNumber: item.serialNumber,
          type: item.type
        }));
        const updatedItems = [...items, ...returnedItems];
        setItems(updatedItems);
        mockDatabase.items = updatedItems;
      }

      // Remove receiver
      const updatedReceivers = receivers.filter(receiver => receiver.id !== receiverId);
      setReceivers(updatedReceivers);
      mockDatabase.receivers = updatedReceivers;
    } catch (error) {
      console.error('Error deleting receiver:', error);
    }
  };

  // Modify functions
  const handleModifyItem = (item) => {
    setEditingItem(item);
    setItemForm({ serialNumber: item.serialNumber, type: item.type });
    setShowItemModal(true);
  };

  const handleModifyReceiver = (receiver) => {
    setEditingReceiver(receiver);
    setReceiverForm({ firstName: receiver.firstName, lastName: receiver.lastName, email: receiver.email });
    setShowReceiverModal(true);
  };

  // Handle Enter key press for forms
  const handleKeyPress = (e, submitFunction) => {
    if (e.key === 'Enter') {
      submitFunction();
    }
  };

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showItemModal) {
          setShowItemModal(false);
        }
        if (showReceiverModal) {
          setShowReceiverModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showItemModal, showReceiverModal, errorModal.show]);

  return (
    <div className="app-container">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          height: 100vh;
          background-color: #f3f4f6;
        }

        .app-container {
          display: flex;
          height: 100vh;
          background-color: #f3f4f6;
        }

        .left-panel {
          width: 20%;
          background-color: white;
          border-right: 1px solid #d1d5db;
          padding: 1rem;
        }

        .right-panel {
          flex: 1;
          padding: 1rem;
        }

        .panel-header {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .button {
          width: 100%;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          font-size: 0.875rem;
        }

        .button-primary {
          background-color: #3b82f6;
          color: white;
        }

        .button-primary:hover {
          background-color: #2563eb;
        }

        .button-secondary {
          background-color: #e5e7eb;
          color: #374151;
        }

        .button-secondary:hover {
          background-color: #d1d5db;
        }

        .button-secondary.active {
          background-color: #6b7280;
          color: white;
        }

        .button-green {
          background-color: #10b981;
          color: white;
          width: auto;
          display: inline-block;
        }

        .button-green:hover {
          background-color: #059669;
        }

        .button-gray {
          background-color: #6b7280;
          color: white;
        }

        .button-gray:hover {
          background-color: #4b5563;
        }

        .items-container {
          max-height: 60vh;
          overflow-y: auto;
          position: relative; /* Add positioning context */
          z-index: 1; /* Lower z-index for container */
        }

        .item-card {
          background-color: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 0.375rem;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          cursor: move;
          position: relative;
          transition: background-color 0.2s;
          font-weight: 500;
          z-index: 2; /* Higher than container but lower than popup */
        }

        .item-card:hover {
          background-color: #bfdbfe;
        }

        .item-card.dragging {
          opacity: 0.5;
        }

        .receiver-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .receiver-card {
          background-color: #f0fdf4;
          border: 2px dashed #86efac;
          border-radius: 0.5rem;
          padding: 1rem;
          min-height: 8rem;
          position: relative;
          transition: all 0.2s;
          cursor: pointer;
        }

        .receiver-card:hover {
          background-color: #dcfce7;
        }

        .receiver-card.drag-over {
          border-color: #22c55e;
          background-color: #dcfce7;
        }

        .receiver-name {
          font-weight: bold;
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
        }

        .assigned-item {
          background-color: #bfdbfe;
          border-radius: 0.375rem;
          padding: 0.25rem 0.5rem;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .assigned-item:hover {
          background-color: #93c5fd;
        }

        .drop-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(34, 197, 94, 0.3);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #166534;
          font-weight: bold;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          width: 24rem;
          max-width: 90vw;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-title {
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 1rem;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .button-row {
          display: flex;
          gap: 0.75rem;
        }

        .button-row .button {
          flex: 1;
        }

        .options-menu {
          position: absolute;
          top: 0;
          right: 0;
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 10;
          min-width: 120px;
        }

        .option-button {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .option-button:hover {
          background-color: #f3f4f6;
        }

        .option-button.delete {
          color: #dc2626;
        }

        .instructions {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.5rem;
          padding: 1rem;
          max-width: 20rem;
          font-size: 0.875rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .instructions h4 {
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .instructions ul {
          list-style-type: none;
          padding: 0;
        }

        .instructions li {
          margin-bottom: 0.25rem;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
          padding: 2rem;
          font-style: italic;
        }
      `}</style>

      {/* A1 - Left Panel (20%) */}
      <div className="left-panel">
        <div className="panel-header">Items</div>
        <div className="button-group">
          <button
            className="button button-primary"
            onClick={() => {
              setEditingItem(null);
              setItemForm({ serialNumber: '', type: 'HMI' });
              setShowItemModal(true);
            }}
          >
            Add an item
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`button button-secondary ${sortBy === 'serial' ? 'active' : ''}`}
              onClick={() => handleSort('serial')}
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
            >
              Sort by serial {sortBy === 'serial' && (sortReverse ? '↓' : '↑')}
            </button>
            <button
              className={`button button-secondary ${sortBy === 'type' ? 'active' : ''}`}
              onClick={() => handleSort('type')}
              style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.5rem' }}
            >
              Sort by type {sortBy === 'type' && (sortReverse ? '↓' : '↑')}
            </button>
          </div>
        </div>

        <div className="items-container">
          {sortedItems.map((item, index) => (
            <DraggableItem
              key={item.id}
              item={item}
              itemIndex={index}
              totalItems={sortedItems.length}
              onModify={handleModifyItem}
              onDelete={handleDeleteItem}
              onDragStart={handleDragStart}
            />
          ))}
          {sortedItems.length === 0 && (
            <div className="empty-state">
              No items in inventory
            </div>
          )}
        </div>
      </div>

      {/* A2 - Right Panel (80%) */}
      <div className="right-panel">
        <div style={{ marginBottom: '1rem' }}>
          <div className="panel-header">Receivers</div>
          <button
            className="button button-green"
            onClick={() => {
              setEditingReceiver(null);
              setReceiverForm({ firstName: '', lastName: '', email: '' });
              setShowReceiverModal(true);
            }}
          >
            Add Receivers
          </button>
        </div>

        <div className="receiver-grid">
          {receivers.map(receiver => (
            <ReceiverCell
              key={receiver.id}
              receiver={receiver}
              onItemDrop={handleItemDrop}
              onModify={handleModifyReceiver}
              onDelete={handleDeleteReceiver}
              onItemRemove={handleItemRemove}
            />
          ))}
          {receivers.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              No receivers added yet
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)}>
        <div className="modal-title">
          {editingItem ? 'Modify Item' : 'Add New Item'}
        </div>
        <div>
          <div className="form-group">
            <label className="form-label">Serial Number *</label>
            <input
              ref={serialNumberRef}
              type="text"
              className="form-input"
              value={itemForm.serialNumber}
              onChange={(e) => setItemForm(prev => ({ ...prev, serialNumber: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleItemSubmit)}
              placeholder="Enter serial number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              className="form-input"
              value={itemForm.type}
              onChange={(e) => setItemForm(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="HMI">HMI</option>
              <option value="Battery">Battery</option>
              <option value="Motor">Motor</option>
              <option value="Range Extender">Range Extender</option>
              <option value="Radar">Radar</option>
            </select>
          </div>
          <div className="button-row">
            <button
              className="button button-primary"
              onClick={handleItemSubmit}
            >
              {editingItem ? 'Update' : 'Add'}
            </button>
            <button
              className="button button-gray"
              onClick={() => setShowItemModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Receiver Modal */}
      <Modal isOpen={showReceiverModal} onClose={() => setShowReceiverModal(false)}>
        <div className="modal-title">
          {editingReceiver ? 'Modify Receiver' : 'Add New Receiver'}
        </div>
        <div>
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              ref={firstNameRef}
              type="text"
              className="form-input"
              value={receiverForm.firstName}
              onChange={(e) => setReceiverForm(prev => ({ ...prev, firstName: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleReceiverSubmit)}
              placeholder="Enter first name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              ref={lastNameRef}
              type="text"
              className="form-input"
              value={receiverForm.lastName}
              onChange={(e) => setReceiverForm(prev => ({ ...prev, lastName: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleReceiverSubmit)}
              placeholder="Enter last name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              ref={emailRef}
              type="email"
              className="form-input"
              value={receiverForm.email}
              onChange={(e) => setReceiverForm(prev => ({ ...prev, email: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleReceiverSubmit)}
              placeholder="Enter email address"
            />
          </div>
          <div className="button-row">
            <button
              className="button button-green"
              onClick={handleReceiverSubmit}
            >
              {editingReceiver ? 'Update' : 'Add'}
            </button>
            <button
              className="button button-gray"
              onClick={() => setShowReceiverModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: '', returnFocus: null })}
        autoFocus={true}
        onClosed={() => {
          if (errorModal.returnFocus && errorModal.returnFocus.current) {
            errorModal.returnFocus.current.focus();
          }
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            marginBottom: '1.5rem',
            color: '#374151',
            fontSize: '1rem',
            whiteSpace: 'pre-line'
          }}>
            {errorModal.message}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="button button-primary"
              onClick={() => setErrorModal({ show: false, message: '', returnFocus: null })}
              style={{ minWidth: '100px' }}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Instructions */}
      <div className="instructions">
        <h4>How to use:</h4>
        <ul>
          <li>• Drag items from left panel to receiver cards</li>
          <li>• Click assigned items to return them to inventory</li>
          <li>• Click items/receivers to modify or delete</li>
          <li>• Items auto-sort when returned to inventory</li>
        </ul>
        <div style={{ marginTop: '0.75rem', padding: '0.5rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '0.375rem' }}>
          <strong style={{ fontSize: '0.75rem', color: '#92400e' }}>Note:</strong>
          <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0 }}>
            This demo uses local storage. For real collaboration, integrate with Firebase Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryTracker;