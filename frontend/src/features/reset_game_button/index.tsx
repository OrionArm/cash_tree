import { useGameContext } from '@/entities/game/use_game_context';
import styles from './reset_game_button.module.css';

export default function ResetGameButton() {
  const { resetGame } = useGameContext();

  const handleReset = async () => {
    if (window.confirm('Вы уверены, что хотите сбросить игру? Все ваши данные будут потеряны!')) {
      await resetGame();
    }
  };

  return (
    <button className={styles.resetButton} onClick={handleReset} title="Сбросить игру">
      🔄 Сбросить игру
    </button>
  );
}
