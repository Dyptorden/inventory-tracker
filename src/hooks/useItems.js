import { useState, useEffect, useCallback, useMemo } from 'react';
import { subscribeToItems, addItem, updateItem, deleteItem } from '../services/firebaseService';

export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('serial');
  const [sortReverse, setSortReverse] = useState(false);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToItems((itemsData) => {
      setItems(itemsData);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sort items
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let result;
      if (sortBy === 'serial') {
        result = a.serialNumber.localeCompare(b.serialNumber);
      } else {
        result = a.type.localeCompare(b.type);
      }
      return sortReverse ? -result : result;
    });
  }, [items, sortBy, sortReverse]);

  // Handle sort button clicks
  const handleSort = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      setSortReverse(!sortReverse);
    } else {
      setSortBy(newSortBy);
      setSortReverse(false);
    }
  }, [sortBy, sortReverse]);

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
      await updateItem(itemId, itemData);
      return { success: true };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, error: 'Failed to update item. Please try again.' };
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      await deleteItem(itemId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, error: 'Failed to delete item. Please try again.' };
    }
  }, []);

  return {
    items,
    sortedItems,
    loading,
    sortBy,
    sortReverse,
    handleSort,
    createItem,
    modifyItem,
    removeItem
  };
};