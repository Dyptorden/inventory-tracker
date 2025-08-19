import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const openModal = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  return {
    isOpen,
    data,
    openModal,
    closeModal
  };
};

export const useErrorModal = () => {
  const [errorModal, setErrorModal] = useState({
    show: false,
    message: '',
    returnFocus: null
  });

  const showError = useCallback((message, returnFocusRef = null) => {
    setErrorModal({ show: true, message, returnFocus: returnFocusRef });
  }, []);

  const hideError = useCallback(() => {
    setErrorModal({ show: false, message: '', returnFocus: null });
  }, []);

  const handleErrorClose = useCallback(() => {
    const { returnFocus } = errorModal;
    hideError();

    // Focus return after modal closes
    if (returnFocus && returnFocus.current) {
      setTimeout(() => {
        returnFocus.current.focus();
      }, 100);
    }
  }, [errorModal, hideError]);

  return {
    errorModal,
    showError,
    hideError,
    handleErrorClose
  };
};