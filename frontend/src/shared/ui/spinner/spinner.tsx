import React from 'react';
import styles from './spinner.module.css';

type Props = {
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

export const Spinner: React.FC<Props> = ({ size = 'medium', className }) => {
  return (
    <div
      className={`${styles.spinner} ${styles[size]} ${className || ''}`}
      role="status"
      aria-label="Загрузка"
    />
  );
};
