import React, { useState, useRef, useEffect } from 'react';
import Modal from '../common/Modal';

const ITEM_TYPES = ['HMI', 'Battery', 'Motor', 'Range Extender', 'Radar'];

const ItemModal = ({ isOpen, onClose, onSubmit, editingItem }) => {
  const [itemForm, setItemForm] = useState({ serialNumber: '', type: 'HMI' });
  const serialNumberRef = useRef(null);

  // Update form when editing item changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setItemForm({
          serialNumber: editingItem.serialNumber,
          type: editingItem.type
        });
      } else {
        setItemForm({ serialNumber: '', type: 'HMI' });
      }
    }
  }, [editingItem, isOpen]);

  // Focus serial number input when modal opens
  useEffect(() => {
    if (isOpen && serialNumberRef.current) {
      setTimeout(() => {
        serialNumberRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(itemForm, serialNumberRef);
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
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
            onKeyPress={handleKeyPress}
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
            {ITEM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="button-row">
          <button className="button button-primary" onClick={handleSubmit}>
            {editingItem ? 'Update' : 'Add'}
          </button>
          <button className="button button-gray" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ItemModal;