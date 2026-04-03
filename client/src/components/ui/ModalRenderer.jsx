import React from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../../context/ModalContext';
import CreateEditModal from './CreateEditModal/CreateEditModal';
import ConfirmDeleteModal from './ConfirmDeleteModal/ConfirmDeleteModal';

const ModalRenderer = () => {
  const { modalState, closeModal } = useModal();
  const { isOpen, type, props } = modalState;

  if (!isOpen) return null;

  const renderModal = () => {
    switch (type) {
      case 'createEdit':
        return (
          <CreateEditModal
            {...props}
            isOpen={isOpen}
            onClose={closeModal}
          />
        );
      case 'confirmDelete':
        return (
          <ConfirmDeleteModal
            {...props}
            isOpen={isOpen}
            onCancel={closeModal}
          />
        );
      default:
        return null;
    }
  };

  return createPortal(
    renderModal(),
    document.body
  );
};

export default ModalRenderer;
