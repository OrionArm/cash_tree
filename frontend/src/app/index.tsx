import { MainPage } from '../pages/main';
import styles from './app.module.css';
import { StrictMode } from 'react';

export default function App() {
  return (
    <StrictMode>
      <div className={styles.app}>
        <MainPage />
      </div>
    </StrictMode>
  );
}
