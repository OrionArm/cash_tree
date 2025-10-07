import React from 'react';
import clsx from 'clsx';
import styles from './input.module.css';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const Input: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  autoFocus = false,
  className = '',
  type = 'text',
  onKeyDown,
}) => {
  return (
    <div className={clsx(styles.field, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={styles.input}
      />
    </div>
  );
};
