// Validation utility functions

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateItemForm = (itemForm, items, receivers, editingItem) => {
  const errors = [];

  if (!itemForm.serialNumber.trim()) {
    errors.push({ field: 'serialNumber', message: 'Serial number is required!' });
    return errors;
  }

  // Check for unique serial number in items array
  const existingInItems = items.find(item =>
    item.serialNumber === itemForm.serialNumber &&
    (!editingItem || item.id !== editingItem.id)
  );

  if (existingInItems) {
    errors.push({
      field: 'serialNumber',
      message: 'There is already an item with that serial in the items list!'
    });
    return errors;
  }

  // Check for unique serial number in assigned items across all receivers
  let assignedToReceiver = null;
  const existingInReceivers = receivers.some(receiver => {
    if (receiver.assignedItems && receiver.assignedItems.some(assignedItem =>
      assignedItem.serialNumber === itemForm.serialNumber
    )) {
      assignedToReceiver = receiver;
      return true;
    }
    return false;
  });

  if (existingInReceivers && assignedToReceiver) {
    errors.push({
      field: 'serialNumber',
      message: `There is already an item with that serial and it is assigned to ${assignedToReceiver.lastName} ${assignedToReceiver.firstName}!`
    });
    return errors;
  }

  return errors;
};

export const validateReceiverForm = (receiverForm, receivers, editingReceiver) => {
  const errors = [];

  // Validate required fields
  if (!receiverForm.firstName.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!receiverForm.lastName.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (!receiverForm.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  // Validate email format if email is provided
  if (receiverForm.email.trim() && !isValidEmail(receiverForm.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Check for unique email if email is provided and valid
  if (receiverForm.email.trim() && isValidEmail(receiverForm.email)) {
    const existingReceiver = receivers.find(receiver =>
      receiver.email === receiverForm.email &&
      (!editingReceiver || receiver.id !== editingReceiver.id)
    );

    if (existingReceiver) {
      errors.push({ field: 'email', message: 'Email must be unique' });
    }
  }

  return errors;
};

export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message + '!';
  }

  return 'Please fix the following errors:\n• ' + errors.map(e => e.message).join('\n• ');
};

export const getFirstErrorField = (errors, refs) => {
  if (errors.length === 0) return null;

  const firstError = errors[0];
  return refs[firstError.field] || null;
};