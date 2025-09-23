import React from 'react';
import clsx from 'clsx';
import styles from './header.module.css';

type Props = {
  title: string;
  className?: string;
  children?: React.ReactNode;
};

export const Header: React.FC<Props> = ({ title, className, children }) => {
  return (
    <header className={clsx(styles.header, className)}>
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.actions}>{children}</div>}
    </header>
  );
};
