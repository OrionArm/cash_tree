import React, { useEffect, useState } from 'react';
import styles from './add_child_modal.module.css';
import { Modal } from '@/shared/ui/modal';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  parentName: string;
};

export const AddChildModal: React.FC<Props> = ({ isOpen, onClose, onSave, parentName }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Добавить дочерний элемент в "${parentName}"`}>
      <div className={styles.modalContent}>
        <Input label="Название:" value={name} onChange={setName} autoFocus />
        <div className={styles.modalButtons}>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} variant="primary">
            Добавить
          </Button>
        </div>
      </div>
    </Modal>
  );
};
