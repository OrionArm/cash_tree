import React from 'react';
import styles from './toggle_button.module.css';

type Props = {
  isExpanded: boolean;
  onClick: (e: React.MouseEvent) => void;
};

export const ToggleButton: React.FC<Props> = ({ isExpanded, onClick }) => {
  return (
    <button className={styles.toggleButton} onClick={onClick} type="button">
      <span className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}>▶</span>
    </button>
  );
};
