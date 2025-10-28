import { Suspense } from 'react';
import { useGameContext } from '@/entities/game/use_game_context';
import { ShopDataLoader } from '@/features/shop';
import styles from './shop.module.css';

export default function ShopPage() {
  const { playerState } = useGameContext();

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
        <h1 className={styles.title}>Лавка</h1>
        <div className={styles.playerGold}>💰 {playerState.gold} золота</div>
      </div>

      <div className={styles.content}>
        <Suspense fallback={<div className={styles.loading}>Загрузка товаров...</div>}>
          <ShopDataLoader />
        </Suspense>
      </div>
    </div>
  );
}
