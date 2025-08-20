import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

// Collections
const ITEMS_COLLECTION = 'items';
const RECEIVERS_COLLECTION = 'receivers';
const HISTORY_COLLECTION = 'itemHistory';

// Helper function to add history entry
const addHistoryEntry = async (serialNumber, operation) => {
  try {
    await addDoc(collection(db, HISTORY_COLLECTION), {
      serialNumber,
      operation,
      timestamp: new Date(),
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding history entry:', error);
    // Don't throw error - history is not critical for operation
  }
};

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

    // Get the current item to check for changes
    const currentDoc = await getDoc(itemRef);

    if (currentDoc.exists()) {
      const currentData = currentDoc.data();
      const changes = [];

      // Check for serial number changes
      if (currentData.serialNumber !== itemData.serialNumber) {
        changes.push(`Serial number updated from ${currentData.serialNumber} to ${itemData.serialNumber}`);
      }

      // Check for type changes
      if (currentData.type !== itemData.type) {
        changes.push(`Type updated from ${currentData.type} to ${itemData.type}`);
      }

      // If there are changes, log them
      if (changes.length > 0) {
        let changeMessage;
        if (changes.length === 1) {
          changeMessage = changes[0];
        } else {
          changeMessage = changes.slice(0, -1).join(', ') + ' and ' + changes[changes.length - 1];
        }

        await addHistoryEntry(itemData.serialNumber, changeMessage);
      }
    }

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

    // Add history entry
    await addHistoryEntry(item.serialNumber, `assigned to ${receiver.email}`);

    return true;
  } catch (error) {
    console.error('Error assigning item to receiver:', error);
    throw error;
  }
};

// Utility function to get all items (including assigned ones with receiver info)
export const getAllItemsWithAssignments = async () => {
  try {
    // Get all items from items collection
    const itemsSnapshot = await getDocs(
      query(collection(db, ITEMS_COLLECTION), orderBy('serialNumber'))
    );
    const unassignedItems = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isAssigned: false,
      receiverEmail: null,
      receiverId: null
    }));

    // Get all receivers and their assigned items
    const receiversSnapshot = await getDocs(
      query(collection(db, RECEIVERS_COLLECTION))
    );
    const assignedItems = [];

    receiversSnapshot.docs.forEach(doc => {
      const receiver = { id: doc.id, ...doc.data() };
      if (receiver.assignedItems) {
        receiver.assignedItems.forEach(item => {
          assignedItems.push({
            id: `assigned-${receiver.id}-${item.serialNumber}`,
            serialNumber: item.serialNumber,
            type: item.type,
            isAssigned: true,
            receiverEmail: receiver.email,
            receiverId: receiver.id,
            receiverName: `${receiver.firstName} ${receiver.lastName}`
          });
        });
      }
    });

    // Combine and sort all items
    const allItems = [...unassignedItems, ...assignedItems];
    return allItems.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
  } catch (error) {
    console.error('Error getting all items with assignments:', error);
    throw error;
  }
};

// Real-time listener for all items (including assigned ones)
export const subscribeToAllItems = (callback) => {
  // We need to listen to both collections
  const itemsQuery = query(collection(db, ITEMS_COLLECTION), orderBy('serialNumber'));
  const receiversQuery = query(collection(db, RECEIVERS_COLLECTION));

  let itemsData = [];
  let receiversData = [];
  let unsubscribeFunctions = [];

  const combineAndCallback = () => {
    // Combine unassigned items with assigned items from receivers
    const unassignedItems = itemsData.map(item => ({
      ...item,
      isAssigned: false,
      receiverEmail: null,
      receiverId: null
    }));

    const assignedItems = [];
    receiversData.forEach(receiver => {
      if (receiver.assignedItems) {
        receiver.assignedItems.forEach(item => {
          assignedItems.push({
            id: `assigned-${receiver.id}-${item.serialNumber}`,
            serialNumber: item.serialNumber,
            type: item.type,
            isAssigned: true,
            receiverEmail: receiver.email,
            receiverId: receiver.id,
            receiverName: `${receiver.firstName} ${receiver.lastName}`
          });
        });
      }
    });

    const allItems = [...unassignedItems, ...assignedItems];
    allItems.sort((a, b) => a.serialNumber.localeCompare(b.serialNumber));
    callback(allItems);
  };

  // Subscribe to items
  const unsubscribeItems = onSnapshot(itemsQuery, (querySnapshot) => {
    itemsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    combineAndCallback();
  }, (error) => {
    console.error('Error in items subscription:', error);
  });

  // Subscribe to receivers
  const unsubscribeReceivers = onSnapshot(receiversQuery, (querySnapshot) => {
    receiversData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    combineAndCallback();
  }, (error) => {
    console.error('Error in receivers subscription:', error);
  });

  unsubscribeFunctions = [unsubscribeItems, unsubscribeReceivers];

  // Return cleanup function
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  };
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

    // Add history entry
    await addHistoryEntry(item.serialNumber, `retrieved from ${receiver.email}`);

    return true;
  } catch (error) {
    console.error('Error returning item to inventory:', error);
    throw error;
  }
};

// Utility function to retrieve an assigned item back to inventory
export const retrieveAssignedItem = async (assignedItem) => {
  try {
    // First, add the item back to items collection
    await addItem({
      serialNumber: assignedItem.serialNumber,
      type: assignedItem.type
    });

    // Then, get the current receiver data and remove the item
    const receivers = await getReceivers();
    const receiver = receivers.find(r => r.id === assignedItem.receiverId);

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    // Remove item from receiver's assigned items
    const updatedAssignedItems = receiver.assignedItems.filter(
      item => !(
        item.serialNumber === assignedItem.serialNumber &&
        item.type === assignedItem.type
      )
    );

    // Update receiver with updated assigned items
    await updateReceiver(assignedItem.receiverId, {
      ...receiver,
      assignedItems: updatedAssignedItems
    });

    // Add history entry
    await addHistoryEntry(assignedItem.serialNumber, `retrieved from ${receiver.email}`);

    return true;
  } catch (error) {
    console.error('Error retrieving assigned item:', error);
    throw error;
  }
};

// Get history for a specific item
export const getItemHistory = async (serialNumber) => {
  try {
    console.log('Fetching history for serial number:', serialNumber);

    const historyQuery = query(
      collection(db, HISTORY_COLLECTION),
      where('serialNumber', '==', serialNumber),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(historyQuery);
    const historyData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('History entry:', data);
      return {
        id: doc.id,
        ...data
      };
    });

    console.log('Total history entries found:', historyData.length);
    return historyData;
  } catch (error) {
    console.error('Error getting item history:', error);

    // If the error is about missing index, try without orderBy
    try {
      console.log('Retrying without orderBy...');
      const simpleQuery = query(
        collection(db, HISTORY_COLLECTION),
        where('serialNumber', '==', serialNumber)
      );

      const querySnapshot = await getDocs(simpleQuery);
      const historyData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort manually by timestamp
      historyData.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return timeB - timeA; // Descending order
      });

      return historyData;
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
      throw retryError;
    }
  }
};