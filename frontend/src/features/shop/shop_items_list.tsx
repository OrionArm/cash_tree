import { useState, useEffect } from 'react';
import { useGameContext } from '@/entities/game/use_game_context';
import type { ShopItem } from '@/services/events/mock/shop_data';
import type { HappenedEffects } from '@/services/events/type';
import { purchaseShopItem, addLogMessage } from '@/shared/local_api';
import { formatRewardsMessageWithNames } from '@/services/events/utils';
import ShopItemCard from './shop_item_card';
import styles from './shop.module.css';

type Props = {
  items: ShopItem[];
};

export default function ShopItemsList({ items }: Props) {
  const { playerState, setPlayerState } = useGameContext();
  const [purchasingItemId, setPurchasingItemId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [availableItems, setAvailableItems] = useState<ShopItem[]>(items);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleEffectsResult = (happenedEffects: HappenedEffects | undefined) => {
    if (happenedEffects) {
      const dialogEffects = {
        ...happenedEffects,
        itemsGain: happenedEffects.itemsGain.map((item) => item.name),
        itemsLose: happenedEffects.itemsLose.map((item) => item.name),
      };

      const effectsMessage = formatRewardsMessageWithNames(dialogEffects);
      setMessage(`✅ ${effectsMessage}`);
      addLogMessage(effectsMessage);
    }
  };

  useEffect(() => {
    setAvailableItems(items);
  }, [items]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handlePurchase = async (itemId: string) => {
    setPurchasingItemId(itemId);
    setIsLoading(true);
    setMessage('');

    try {
      const result = await purchaseShopItem(itemId);

      if (result.success) {
        handleEffectsResult(result.happenedEffects);
        if (result.newState) setPlayerState(result.newState);
        setAvailableItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage(`❌ Ошибка при покупке товара`);
      console.error('Ошибка покупки:', error);
    } finally {
      setPurchasingItemId(null);
      setIsLoading(false);
    }
  };

  if (availableItems.length === 0) {
    return (
      <div className={styles.shopEmpty}>
        <p>В лавке пока нет доступных товаров</p>
      </div>
    );
  }

  return (
    <div className={styles.shopContainer}>
      {message && <div className={styles.shopMessage}>{message}</div>}

      {isLoading && (
        <div className={styles.shopLoader}>
          <div className={styles.loaderSpinner}></div>
          <p>Обработка покупки...</p>
        </div>
      )}

      <div className={styles.shopItemsGrid}>
        {availableItems.map((item) => (
          <ShopItemCard
            key={item.id}
            item={item}
            playerGold={playerState!.gold}
            isPurchasing={purchasingItemId === item.id}
            isDisabled={isLoading}
            onPurchase={() => handlePurchase(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
