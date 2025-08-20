import React, { useEffect } from 'react';
import cyborgImage from './assets/cyborg_rider_001.png';

// Import styles
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

// Import hooks
import { useItems } from './hooks/useItems';
import { useReceivers } from './hooks/useReceivers';
import { useModal, useErrorModal } from './hooks/useModal';

// Import components
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorModal from './components/common/ErrorModal';
import HistoryModal from './components/common/HistoryModal';
import LeftPanel from './components/layout/LeftPanel';
import RightPanel from './components/layout/RightPanel';
import Instructions from './components/layout/Instructions';
import ItemModal from './components/items/ItemModal';
import ReceiverModal from './components/receivers/ReceiverModal';

// Import utilities
import {
  validateItemForm,
  validateReceiverForm,
  formatValidationErrors,
  getFirstErrorField
} from './utils/validation';

const InventoryTracker = () => {
  // Custom hooks
  const {
    sortedItems,
    loading: itemsLoading,
    sortBy,
    sortReverse,
    showUnassignedOnly,
    hoveredItemReceiverId,
    handleSort,
    toggleUnassignedOnly,
    handleItemHover,
    handleItemHoverEnd,
    createItem,
    modifyItem,
    removeItem,
    retrieveItem
  } = useItems();

  const {
    receivers,
    loading: receiversLoading,
    createReceiver,
    modifyReceiver,
    removeReceiver,
    assignItem,
    returnItem
  } = useReceivers();

  // Modal hooks
  const itemModal = useModal();
  const receiverModal = useModal();
  const historyModal = useModal();
  const { errorModal, showError, handleErrorClose } = useErrorModal();

  // Loading state
  const loading = itemsLoading || receiversLoading;

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (itemModal.isOpen) itemModal.closeModal();
        if (receiverModal.isOpen) receiverModal.closeModal();
        if (historyModal.isOpen) historyModal.closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [itemModal, receiverModal, historyModal]);

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleItemDrop = async (item, receiverId) => {
    const result = await assignItem(item, receiverId);
    if (!result.success) {
      showError(result.error);
    }
  };

  const handleItemRemove = async (item, receiverId) => {
    const result = await returnItem(item, receiverId);
    if (!result.success) {
      showError(result.error);
    }
  };

  // Item operations
  const handleAddItem = () => {
    itemModal.openModal(null);
  };

  const handleItemModify = (item) => {
    itemModal.openModal(item);
  };

  const handleItemDelete = async (itemId) => {
    const result = await removeItem(itemId);
    if (!result.success) {
      showError(result.error);
    }
  };

  const handleItemSubmit = async (itemForm, serialNumberRef) => {
    // Validate form
    const errors = validateItemForm(itemForm, sortedItems, receivers, itemModal.data);

    if (errors.length > 0) {
      const errorMessage = formatValidationErrors(errors);
      const firstErrorRef = getFirstErrorField(errors, { serialNumber: serialNumberRef });
      showError(errorMessage, firstErrorRef);
      return;
    }

    // Submit item
    const isEditing = !!itemModal.data;
    const result = isEditing
      ? await modifyItem(itemModal.data.id, itemForm)
      : await createItem(itemForm);

    if (result.success) {
      itemModal.closeModal();
    } else {
      showError(result.error);
    }
  };

  const handleItemRetrieve = async (item) => {
    const result = await retrieveItem(item);
    if (!result.success) {
      showError(result.error);
    }
  };

  const handleItemHistory = (serialNumber) => {
    historyModal.openModal(serialNumber);
  };

  // Receiver operations
  const handleAddReceiver = () => {
    receiverModal.openModal(null);
  };

  const handleReceiverModify = (receiver) => {
    receiverModal.openModal(receiver);
  };

  const handleReceiverDelete = async (receiverId) => {
    const result = await removeReceiver(receiverId);
    if (!result.success) {
      showError(result.error);
    }
  };

  const handleReceiverSubmit = async (receiverForm, refs) => {
    // Validate form
    const errors = validateReceiverForm(receiverForm, receivers, receiverModal.data);

    if (errors.length > 0) {
      const errorMessage = formatValidationErrors(errors);
      const firstErrorRef = getFirstErrorField(errors, refs);
      showError(errorMessage, firstErrorRef);
      return;
    }

    // Prepare receiver data
    const receiverData = {
      ...receiverForm,
      assignedItems: receiverModal.data?.assignedItems || []
    };

    // Submit receiver
    const isEditing = !!receiverModal.data;
    const result = isEditing
      ? await modifyReceiver(receiverModal.data.id, receiverData)
      : await createReceiver(receiverData);

    if (result.success) {
      receiverModal.closeModal();
    } else {
      showError(result.error);
    }
  };

  // Show loading spinner while connecting to Firebase
  if (loading) {
    return <LoadingSpinner message="Connecting to Firebase..." />;
  }

  return (
    <div className="app-container">
      {/* Left Panel - Items */}
      <LeftPanel
        items={sortedItems}
        sortBy={sortBy}
        sortReverse={sortReverse}
        onSort={handleSort}
        onAddItem={handleAddItem}
        onItemModify={handleItemModify}
        onItemDelete={handleItemDelete}
        onDragStart={handleDragStart}
        showUnassignedOnly={showUnassignedOnly}
        onToggleUnassigned={toggleUnassignedOnly}
        onItemHover={handleItemHover}
        onItemHoverEnd={handleItemHoverEnd}
        onItemRetrieve={handleItemRetrieve}
        onItemHistory={handleItemHistory}
      />

      {/* Right Panel - Receivers */}
      <RightPanel
        receivers={receivers}
        onAddReceiver={handleAddReceiver}
        onItemDrop={handleItemDrop}
        onReceiverModify={handleReceiverModify}
        onReceiverDelete={handleReceiverDelete}
        onItemRemove={handleItemRemove}
        backgroundImage={cyborgImage}
        highlightedReceiverId={hoveredItemReceiverId}
      />

      {/* Modals */}
      <ItemModal
        isOpen={itemModal.isOpen}
        onClose={itemModal.closeModal}
        onSubmit={handleItemSubmit}
        editingItem={itemModal.data}
      />

      <ReceiverModal
        isOpen={receiverModal.isOpen}
        onClose={receiverModal.closeModal}
        onSubmit={handleReceiverSubmit}
        editingReceiver={receiverModal.data}
      />

      <ErrorModal
        errorModal={errorModal}
        onClose={handleErrorClose}
      />

      <HistoryModal
        isOpen={historyModal.isOpen}
        onClose={historyModal.closeModal}
        serialNumber={historyModal.data}
      />

      {/* Instructions */}
      <Instructions />
    </div>
  );
};

export default InventoryTracker;