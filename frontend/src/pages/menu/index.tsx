import styles from './menu.module.css';

type Props = {
  onStartGame?: () => void;
  onSettings?: () => void;
  onExit?: () => void;
};

export default function MenuPage({ onStartGame, onSettings, onExit }: Props) {
  return (
    <div className={styles.menu}>
      <div className={styles.menuContent}>
        <h1 className={styles.title}>Приключение</h1>
        <p className={styles.subtitle}>Выберите действие</p>

        <div className={styles.menuButtons}>
          <button className={styles.menuButton} onClick={onStartGame}>
            Начать игру
          </button>

          <button className={styles.menuButton} onClick={onSettings}>
            Настройки
          </button>

          <button className={styles.menuButton} onClick={onExit}>
            Выход
          </button>
        </div>
      </div>
    </div>
  );
}
