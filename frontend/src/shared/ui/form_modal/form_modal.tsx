import React, { useEffect, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import styles from './form_modal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  inputLabel: string;
  initialValue?: string;
  saveButtonText?: string;
  placeholder?: string;
};

export const FormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  title,
  inputLabel,
  initialValue = '',
  saveButtonText = 'Сохранить',
  placeholder,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSave(trimmedValue);
      setValue('');
      // onClose вызывается автоматически через effector в cache_modals.ts
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.modalContent}>
        <Input
          label={inputLabel}
          value={value}
          onChange={setValue}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
        <div className={styles.modalButtons}>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!value.trim()} variant="primary">
            {saveButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
