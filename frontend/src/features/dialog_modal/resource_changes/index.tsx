import styles from './resource_changes.module.css';

type Props = {
  health: number;
  gold: number;
  cristal: number;
};

export default function ResourceChanges({ health, gold, cristal }: Props) {
  const hasChanges = health !== 0 || gold !== 0 || cristal !== 0;

  if (!hasChanges) return null;

  return (
    <div className={styles.itemsSection}>
      <div className={styles.resourcesHeader}>
        <div className={styles.sectionTitle}>Изменение ресурсов:</div>
        <div className={styles.inlineStatsChanges}>
          {health !== 0 && (
            <div className={styles.statChange}>
              <span className={styles.statIcon}>❤️</span>
              <span
                className={`${styles.statValue} ${health > 0 ? styles.positive : styles.negative}`}
              >
                {health > 0 ? '+' : ''}
                {health}
              </span>
            </div>
          )}
          {gold !== 0 && (
            <div className={styles.statChange}>
              <span className={styles.statIcon}>💰</span>
              <span
                className={`${styles.statValue} ${gold > 0 ? styles.positive : styles.negative}`}
              >
                {gold > 0 ? '+' : ''}
                {gold}
              </span>
            </div>
          )}
          {cristal !== 0 && (
            <div className={styles.statChange}>
              <span className={styles.statIcon}>💎</span>
              <span
                className={`${styles.statValue} ${cristal > 0 ? styles.positive : styles.negative}`}
              >
                {cristal > 0 ? '+' : ''}
                {cristal}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
