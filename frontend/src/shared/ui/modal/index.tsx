import { type ReactNode } from 'react';
import styles from './modal.module.css';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  closeOnOverlayClick?: boolean;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className,
  closeOnOverlayClick = true,
}: Props) {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal onClick={handleOverlayClick}>
      <div className={`${styles.modal} ${className || ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
