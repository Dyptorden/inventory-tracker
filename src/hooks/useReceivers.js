import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToReceivers,
  addReceiver,
  updateReceiver,
  deleteReceiver,
  assignItemToReceiver,
  returnItemToInventory,
  addItem
} from '../services/firebaseService';

export const useReceivers = () => {
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set up real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToReceivers((receiversData) => {
      setReceivers(receiversData);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Receiver operations
  const createReceiver = useCallback(async (receiverData) => {
    try {
      await addReceiver(receiverData);
      return { success: true };
    } catch (error) {
      console.error('Error creating receiver:', error);
      return { success: false, error: 'Failed to save receiver. Please try again.' };
    }
  }, []);

  const modifyReceiver = useCallback(async (receiverId, receiverData) => {
    try {
      await updateReceiver(receiverId, receiverData);
      return { success: true };
    } catch (error) {
      console.error('Error updating receiver:', error);
      return { success: false, error: 'Failed to update receiver. Please try again.' };
    }
  }, []);

  const removeReceiver = useCallback(async (receiverId) => {
    try {
      // First, return all assigned items to the items list
      const receiver = receivers.find(r => r.id === receiverId);
      if (receiver?.assignedItems) {
        for (const item of receiver.assignedItems) {
          await addItem({
            serialNumber: item.serialNumber,
            type: item.type
          });
        }
      }

      // Remove receiver
      await deleteReceiver(receiverId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting receiver:', error);
      return { success: false, error: 'Failed to delete receiver. Please try again.' };
    }
  }, [receivers]);

  // Item assignment operations
  const assignItem = useCallback(async (item, receiverId) => {
    try {
      await assignItemToReceiver(item, receiverId);
      return { success: true };
    } catch (error) {
      console.error('Error assigning item:', error);
      return { success: false, error: 'Failed to assign item. Please try again.' };
    }
  }, []);

  const returnItem = useCallback(async (item, receiverId) => {
    try {
      await returnItemToInventory(item, receiverId);
      return { success: true };
    } catch (error) {
      console.error('Error returning item:', error);
      return { success: false, error: 'Failed to return item to inventory. Please try again.' };
    }
  }, []);

  return {
    receivers,
    loading,
    createReceiver,
    modifyReceiver,
    removeReceiver,
    assignItem,
    returnItem
  };
};