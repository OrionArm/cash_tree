import { type ReactNode } from 'react';
import styles from './modal.module.css';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

export default function Modal({ isOpen, onClose, children, className }: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal onClick={onClose}>
      <div className={`${styles.modal} ${className || ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
