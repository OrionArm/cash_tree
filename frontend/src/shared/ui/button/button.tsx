import React from 'react';
import clsx from 'clsx';
import styles from './button.module.css';

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: string;
  title?: string;
  mode?: 'default' | 'compact';
};

export const Button: React.FC<Props> = ({
  children,
  onClick,
  disabled = false,
  variant = 'secondary',
  type = 'button',
  className = '',
  icon,
  title,
  mode = 'default',
}) => {
  const buttonClassName = clsx(
    mode === 'compact' ? styles.compact : styles.button,
    styles[variant],
    className,
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClassName}
      title={title}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
