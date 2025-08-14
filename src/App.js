import React, { useState } from 'react';

// Mock database for demonstration (replace with actual Firebase in production)
let mockDatabase = {
  items: [],
  receivers: [],
  nextId: 1
};

// Component for draggable items
const DraggableItem = ({ item, onModify, onDelete, onDragStart }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="bg-blue-100 border border-blue-300 rounded p-2 mb-2 cursor-move relative hover:bg-blue-200 transition-colors"
      onClick={() => setShowOptions(!showOptions)}
    >
      <div className="font-medium">{item.serialNumber}_{item.type}</div>
      {showOptions && (
        <div className="absolute top-0 right-0 bg-white border rounded shadow-lg z-10">
          <button
            className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onModify(item);
              setShowOptions(false);
            }}
          >
            Modify
          </button>
          <button
            className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm text-red-600"
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
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
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-4 m-2 min-h-32 relative transition-colors ${
        dragOver ? 'border-green-500 bg-green-100' : ''
      }`}
      onClick={() => setShowOptions(!showOptions)}
    >
      <div className="font-bold text-lg mb-2">
        {receiver.lastName}, {receiver.firstName}
      </div>

      {receiver.assignedItems && receiver.assignedItems.map((item, index) => (
        <div
          key={index}
          className="bg-blue-200 rounded px-2 py-1 mb-1 text-sm cursor-pointer hover:bg-blue-300 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onItemRemove(item, receiver.id);
          }}
          title="Click to return item to inventory"
        >
          {item.serialNumber}_{item.type}
        </div>
      ))}

      {dragOver && (
        <div className="absolute inset-0 bg-green-200 bg-opacity-50 flex items-center justify-center text-green-800 font-bold rounded-lg">
          Drop item here
        </div>
      )}

      {showOptions && (
        <div className="absolute top-2 right-2 bg-white border rounded shadow-lg z-10">
          <button
            className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onModify(receiver);
              setShowOptions(false);
            }}
          >
            Modify
          </button>
          <button
            className="block w-full px-3 py-1 text-left hover:bg-gray-100 text-sm text-red-600"
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
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
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

  // Form states
  const [itemForm, setItemForm] = useState({ serialNumber: '', type: 'HMI' });
  const [receiverForm, setReceiverForm] = useState({ firstName: '', lastName: '' });

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'serial') {
      return a.serialNumber.localeCompare(b.serialNumber);
    } else {
      return a.type.localeCompare(b.type);
    }
  });

  // Handle drag start for items
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  // Add or update item
  const handleItemSubmit = () => {
    if (!itemForm.serialNumber.trim()) return;

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
    if (!receiverForm.firstName.trim() || !receiverForm.lastName.trim()) return;

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
      setReceiverForm({ firstName: '', lastName: '' });
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
        if (sortBy === 'serial') {
          return a.serialNumber.localeCompare(b.serialNumber);
        } else {
          return a.type.localeCompare(b.type);
        }
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
    setReceiverForm({ firstName: receiver.firstName, lastName: receiver.lastName });
    setShowReceiverModal(true);
  };

  // Handle Enter key press for forms
  const handleKeyPress = (e, submitFunction) => {
    if (e.key === 'Enter') {
      submitFunction();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* A1 - Left Panel (20%) */}
      <div className="w-1/5 bg-white border-r border-gray-300 p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Items</h2>
          <div className="space-y-2">
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              onClick={() => {
                setEditingItem(null);
                setItemForm({ serialNumber: '', type: 'HMI' });
                setShowItemModal(true);
              }}
            >
              Add an item
            </button>
            <button
              className={`w-full py-2 px-4 rounded transition-colors ${
                sortBy === 'serial'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSortBy('serial')}
            >
              Sort by serial number
            </button>
            <button
              className={`w-full py-2 px-4 rounded transition-colors ${
                sortBy === 'type'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSortBy('type')}
            >
              Sort by type
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedItems.map(item => (
            <DraggableItem
              key={item.id}
              item={item}
              onModify={handleModifyItem}
              onDelete={handleDeleteItem}
              onDragStart={handleDragStart}
            />
          ))}
          {sortedItems.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No items in inventory
            </div>
          )}
        </div>
      </div>

      {/* A2 - Right Panel (80%) */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-4">Receivers</h2>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            onClick={() => {
              setEditingReceiver(null);
              setReceiverForm({ firstName: '', lastName: '' });
              setShowReceiverModal(true);
            }}
          >
            Add Receivers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="col-span-full text-gray-500 text-center py-8">
              No receivers added yet
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)}>
        <h3 className="text-lg font-bold mb-4">
          {editingItem ? 'Modify Item' : 'Add New Item'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Serial Number *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={itemForm.serialNumber}
              onChange={(e) => setItemForm(prev => ({ ...prev, serialNumber: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleItemSubmit)}
              placeholder="Enter serial number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Type *</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="flex gap-3">
            <button
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              onClick={handleItemSubmit}
            >
              {editingItem ? 'Update' : 'Add'}
            </button>
            <button
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              onClick={() => setShowItemModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Receiver Modal */}
      <Modal isOpen={showReceiverModal} onClose={() => setShowReceiverModal(false)}>
        <h3 className="text-lg font-bold mb-4">
          {editingReceiver ? 'Modify Receiver' : 'Add New Receiver'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">First Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={receiverForm.firstName}
              onChange={(e) => setReceiverForm(prev => ({ ...prev, firstName: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleReceiverSubmit)}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={receiverForm.lastName}
              onChange={(e) => setReceiverForm(prev => ({ ...prev, lastName: e.target.value }))}
              onKeyPress={(e) => handleKeyPress(e, handleReceiverSubmit)}
              placeholder="Enter last name"
            />
          </div>
          <div className="flex gap-3">
            <button
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              onClick={handleReceiverSubmit}
            >
              {editingReceiver ? 'Update' : 'Add'}
            </button>
            <button
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              onClick={() => setShowReceiverModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Instructions */}
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm shadow-lg">
        <h4 className="font-bold text-sm mb-2">How to use:</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Drag items from left panel to receiver cards</li>
          <li>• Click assigned items to return them to inventory</li>
          <li>• Click items/receivers to modify or delete</li>
          <li>• Items auto-sort when returned to inventory</li>
        </ul>
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This demo uses local storage. For real collaboration, integrate with Firebase Firestore.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InventoryTracker;