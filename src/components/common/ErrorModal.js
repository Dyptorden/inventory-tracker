import React from 'react';
import Modal from './Modal';

const ErrorModal = ({ errorModal, onClose }) => {
  return (
    <Modal
      isOpen={errorModal.show}
      onClose={onClose}
      autoFocus={true}
      onClosed={() => {
        if (errorModal.returnFocus && errorModal.returnFocus.current) {
          errorModal.returnFocus.current.focus();
        }
      }}
    >
      <div className="error-modal-content">
        <div className="error-message">
          {errorModal.message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            className="button button-primary"
            onClick={onClose}
            style={{ minWidth: '100px' }}
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;