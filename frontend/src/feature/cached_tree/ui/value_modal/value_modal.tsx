import React, { useEffect, useState } from 'react';
import styles from './value_modal.module.css';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
  nodeName: string;
};

export const ValueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialValue = '',
  nodeName,
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Задать значение для "${nodeName}"`}>
      <div className={styles.modalContent}>
        <Input label="Значение:" value={value} onChange={setValue} autoFocus />
        <div className={styles.modalButtons}>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!value.trim()} variant="primary">
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
};
