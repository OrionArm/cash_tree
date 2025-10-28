import { useGameContext } from '@/entities/game/use_game_context';
import RankingDataLoader from '@/features/ranking';
import ResetGameButton from '@/features/reset_game_button';
import { Suspense } from 'react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const { playerState, gameStatus } = useGameContext();

  if (!playerState) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка данных игрока...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Профиль игрока</h1>
        <ResetGameButton />
      </div>

      {gameStatus === 'lost' && (
        <div className={styles.gameResult}>
          <div className={styles.gameResultMessage}>
            <span className={styles.gameResultIcon}>💀</span>
            <span className={styles.gameResultText}>Вы проиграли!</span>
          </div>
        </div>
      )}

      {gameStatus === 'won' && (
        <div className={styles.gameResult}>
          <div className={styles.gameResultMessage}>
            <span className={styles.gameResultIcon}>🏆</span>
            <span className={styles.gameResultText}>Вы победили!</span>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.playerInfo}>
          <h2 className={styles.playerName}>{playerState.name}</h2>
          <div className={styles.playerId}>ID: {playerState.id}</div>
        </div>

        <div className={styles.statsSection}>
          <h3 className={styles.sectionTitle}>Характеристики</h3>

          <div className={styles.healthCard}>
            <div className={styles.statIcon}>❤️</div>
            <div className={styles.statInfo}>
              <div className={styles.statName}>Здоровье</div>
              <div className={styles.statValue}>
                {playerState.health} / {playerState.maxHealth}
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>💎</div>
              <div className={styles.statInfo}>
                <div className={styles.statName}>Кристаллы</div>
                <div className={styles.statValue}>{playerState.cristal}</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>
                <img
                  src="/gold-dollar-coin.svg"
                  alt="Золото"
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statName}>Золото</div>
                <div className={styles.statValue}>{playerState.gold}</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>⚡</div>
              <div className={styles.statInfo}>
                <div className={styles.statName}>Энергия</div>
                <div className={styles.statValue}>{playerState.energy}</div>
              </div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIcon}>🦶</div>
              <div className={styles.statInfo}>
                <div className={styles.statName}>Шаги</div>
                <div className={styles.statValue}>{playerState.position}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.itemsSection}>
          <h3 className={styles.sectionTitle}>Предметы</h3>
          {playerState.items.length > 0 ? (
            <div className={styles.itemsGrid}>
              {playerState.items.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemDescription}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyItems}>У вас пока нет предметов</div>
          )}
        </div>

        <Suspense fallback={<div className={styles.loading}>Загрузка рейтинга...</div>}>
          <RankingDataLoader playerState={playerState} />
        </Suspense>
      </div>
    </div>
  );
}
