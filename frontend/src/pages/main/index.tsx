import React from 'react';
import styles from './main.module.css';
import { CachedTreeView } from '@/feature/cached_tree';
import { DBTreeView } from '@/feature/db_tree';
import { Header } from '@/shared/ui/header';

export const MainPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <Header title="Cash Tree" />

      <main className={styles.content}>
        <CachedTreeView />
        <DBTreeView />
      </main>
    </div>
  );
};
