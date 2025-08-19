import React, { useRef, useEffect } from 'react';

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

export default Modal;