import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  subscribeToItems,
  subscribeToAllItems,
  addItem,
  updateItem,
  deleteItem,
  retrieveAssignedItem
} from '../services/firebaseService';

export const useItems = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('serial');
  const [sortReverse, setSortReverse] = useState(false);
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(true);
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Set up real-time listener for all items (including assigned ones)
  useEffect(() => {
    const unsubscribe = subscribeToAllItems((itemsData) => {
      setAllItems(itemsData);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filter items based on unassigned toggle
  const filteredItems = useMemo(() => {
    if (showUnassignedOnly) {
      return allItems.filter(item => !item.isAssigned);
    }
    return allItems;
  }, [allItems, showUnassignedOnly]);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let result;
      if (sortBy === 'serial') {
        result = a.serialNumber.localeCompare(b.serialNumber);
      } else {
        result = a.type.localeCompare(b.type);
      }
      return sortReverse ? -result : result;
    });
  }, [filteredItems, sortBy, sortReverse]);

  // Handle sort button clicks
  const handleSort = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortReverse(!sortReverse);
    } else {
      setSortBy(newSortBy);
      setSortReverse(false);
    }
  }, [sortBy, sortReverse]);

  // Toggle unassigned filter
  const toggleUnassignedOnly = useCallback(() => {
    setShowUnassignedOnly(prev => !prev);
  }, []);

  // Item hover handlers
  const handleItemHover = useCallback((itemId) => {
    setHoveredItemId(itemId);
  }, []);

  const handleItemHoverEnd = useCallback(() => {
    setHoveredItemId(null);
  }, []);

  // Get receiver ID for hovered item
  const hoveredItemReceiverId = useMemo(() => {
    if (!hoveredItemId) return null;
    const hoveredItem = allItems.find(item => item.id === hoveredItemId);
    return hoveredItem?.receiverId || null;
  }, [hoveredItemId, allItems]);

  // Item operations
  const createItem = useCallback(async (itemData) => {
    try {
      await addItem(itemData);
      return { success: true };
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, error: 'Failed to save item. Please try again.' };
    }
  }, []);

  const modifyItem = useCallback(async (itemId, itemData) => {
    try {
      // If it's an assigned item, we need to handle it differently
      if (itemId.startsWith('assigned-')) {
        // For now, we'll show an error - modifying assigned items needs special handling
        return { success: false, error: 'Cannot modify assigned items directly. Please return to inventory first.' };
      }
      await updateItem(itemId, itemData);
      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: 'Failed to update item. Please try again.' };
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      // If it's an assigned item, we need to handle it differently
      if (itemId.startsWith('assigned-')) {
        return { success: false, error: 'Cannot delete assigned items directly. Please retrieve them first.' };
      }
      await deleteItem(itemId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: 'Failed to delete item. Please try again.' };
    }
  }, []);

  // Retrieve assigned item
  const retrieveItem = useCallback(async (assignedItem) => {
    try {
      await retrieveAssignedItem(assignedItem);
      return { success: true };
    } catch (error) {
      console.error('Error retrieving item:', error);
      return { success: false, error: 'Failed to retrieve item. Please try again.' };
    }
  }, []);

  return {
    items: sortedItems,
    sortedItems,
    allItems,
    loading,
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
  };
};