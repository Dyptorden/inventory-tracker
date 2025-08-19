import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';

// Collections
const ITEMS_COLLECTION = 'items';
const RECEIVERS_COLLECTION = 'receivers';

// Item operations
export const addItem = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
      ...itemData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...itemData };
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

export const updateItem = async (itemId, itemData) => {
  try {
    const itemRef = doc(db, ITEMS_COLLECTION, itemId);
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: new Date()
    });
    return { id: itemId, ...itemData };
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, ITEMS_COLLECTION, itemId));
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getItems = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, ITEMS_COLLECTION), orderBy('serialNumber'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

// Real-time listener for items
export const subscribeToItems = (callback) => {
  const q = query(collection(db, ITEMS_COLLECTION), orderBy('serialNumber'));
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  }, (error) => {
    console.error('Error in items subscription:', error);
  });
};

// Receiver operations
export const addReceiver = async (receiverData) => {
  try {
    const docRef = await addDoc(collection(db, RECEIVERS_COLLECTION), {
      ...receiverData,
      assignedItems: receiverData.assignedItems || [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...receiverData };
  } catch (error) {
    console.error('Error adding receiver:', error);
    throw error;
  }
};

export const updateReceiver = async (receiverId, receiverData) => {
  try {
    const receiverRef = doc(db, RECEIVERS_COLLECTION, receiverId);
    await updateDoc(receiverRef, {
      ...receiverData,
      updatedAt: new Date()
    });
    return { id: receiverId, ...receiverData };
  } catch (error) {
    console.error('Error updating receiver:', error);
    throw error;
  }
};

export const deleteReceiver = async (receiverId) => {
  try {
    await deleteDoc(doc(db, RECEIVERS_COLLECTION, receiverId));
  } catch (error) {
    console.error('Error deleting receiver:', error);
    throw error;
  }
};

export const getReceivers = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, RECEIVERS_COLLECTION), orderBy('lastName'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting receivers:', error);
    throw error;
  }
};

// Real-time listener for receivers
export const subscribeToReceivers = (callback) => {
  const q = query(collection(db, RECEIVERS_COLLECTION), orderBy('lastName'));
  return onSnapshot(q, (querySnapshot) => {
    const receivers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(receivers);
  }, (error) => {
    console.error('Error in receivers subscription:', error);
  });
};

// Utility function to assign item to receiver
export const assignItemToReceiver = async (item, receiverId) => {
  try {
    // First, delete the item from items collection
    await deleteItem(item.id);

    // Then, get the current receiver data
    const receivers = await getReceivers();
    const receiver = receivers.find(r => r.id === receiverId);

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Add item to receiver's assigned items
    const updatedAssignedItems = [
      ...(receiver.assignedItems || []),
      {
        serialNumber: item.serialNumber,
        type: item.type
      }
    ];

    // Update receiver with new assigned items
    await updateReceiver(receiverId, {
      ...receiver,
      assignedItems: updatedAssignedItems
    });

    return true;
  } catch (error) {
    console.error('Error assigning item to receiver:', error);
    throw error;
  }
};

// Utility function to return item from receiver to inventory
export const returnItemToInventory = async (item, receiverId) => {
  try {
    // First, add the item back to items collection
    await addItem({
      serialNumber: item.serialNumber,
      type: item.type
    });

    // Then, get the current receiver data
    const receivers = await getReceivers();
    const receiver = receivers.find(r => r.id === receiverId);

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Remove item from receiver's assigned items
    const updatedAssignedItems = receiver.assignedItems.filter(
      assignedItem => !(
        assignedItem.serialNumber === item.serialNumber &&
        assignedItem.type === item.type
      )
    );

    // Update receiver with updated assigned items
    await updateReceiver(receiverId, {
      ...receiver,
      assignedItems: updatedAssignedItems
    });

    return true;
  } catch (error) {
    console.error('Error returning item to inventory:', error);
    throw error;
  }
};