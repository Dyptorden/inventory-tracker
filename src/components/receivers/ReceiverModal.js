import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';

const ReceiverModal = ({ isOpen, onClose, onSubmit, editingReceiver }) => {
  const [receiverForm, setReceiverForm] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);

  // Update form when editing receiver changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingReceiver) {
        setReceiverForm({
          firstName: editingReceiver.firstName,
          lastName: editingReceiver.lastName,
          email: editingReceiver.email
        });
      } else {
        setReceiverForm({ firstName: '', lastName: '', email: '' });
      }
    }
  }, [editingReceiver, isOpen]);

  // Focus first name input when modal opens
  useEffect(() => {
    if (isOpen && firstNameRef.current) {
      setTimeout(() => {
        firstNameRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const refs = {
      firstName: firstNameRef,
      lastName: lastNameRef,
      email: emailRef
    };
    onSubmit(receiverForm, refs);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClose = () => {
    onClose();
    // Don't reset form here - let the effect handle it
  };

  const updateForm = (field) => (e) => {
    setReceiverForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
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
            onChange={updateForm('firstName')}
            onKeyPress={handleKeyPress}
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
            onChange={updateForm('lastName')}
            onKeyPress={handleKeyPress}
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
            onChange={updateForm('email')}
            onKeyPress={handleKeyPress}
            placeholder="Enter email address"
          />
        </div>
        <div className="button-row">
          <button className="button button-green" onClick={handleSubmit}>
            {editingReceiver ? 'Update' : 'Add'}
          </button>
          <button className="button button-gray" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiverModal;