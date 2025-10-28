import styles from './loading_screen.module.css';

type Props = {
  progress?: number;
  loadingText?: string;
};

export default function LoadingScreen({ progress = 0, loadingText = 'Загрузка...' }: Props) {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <h1 className={styles.title}>Приключение</h1>
        <p className={styles.subtitle}>Подготовка к путешествию</p>

        <div className={styles.loadingSpinner} />

        <div className={styles.loadingText}>{loadingText}</div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
