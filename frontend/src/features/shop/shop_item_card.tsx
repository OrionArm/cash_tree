import type { ShopItem } from '@/services/events/mock/shop_data';
import styles from './shop.module.css';

type Props = {
  item: ShopItem;
  playerGold: number;
  isPurchasing: boolean;
  isDisabled?: boolean;
  onPurchase: () => void;
};

export default function ShopItemCard({
  item,
  playerGold,
  isPurchasing,
  isDisabled = false,
  onPurchase,
}: Props) {
  const canAfford = playerGold >= item.cost;
  const isConsumable = item.type === 'consumable';
  const isClaim = item.type === 'claim';
  const isButtonDisabled = !canAfford || isPurchasing || isDisabled;

  const getTypeLabel = () => {
    if (isConsumable) return 'Расходник';
    if (isClaim) return 'Награда';
    return 'Товар';
  };

  return (
    <div className={`${styles.shopItemCard} ${!canAfford ? styles.insufficientFunds : ''}`}>
      <div className={styles.shopItemHeader}>
        <div className={styles.shopItemStats}>
          {item.effects.gold > 0 && (
            <span className={`${styles.shopStat} ${styles.gold}`}>💰 +{item.effects.gold}</span>
          )}
          {item.effects.health > 0 && (
            <span className={`${styles.shopStat} ${styles.health}`}>❤️ +{item.effects.health}</span>
          )}
          {item.effects.energy > 0 && (
            <span className={`${styles.shopStat} ${styles.energy}`}>⚡ +{item.effects.energy}</span>
          )}
          {item.effects.cristal > 0 && (
            <span className={`${styles.shopStat} ${styles.cristal}`}>
              💎 +{item.effects.cristal}
            </span>
          )}
        </div>
        <div className={styles.shopItemType}>{getTypeLabel()}</div>
      </div>

      <div className={styles.shopItemContent}>
        {item.imageUrl && (
          <div className={styles.shopItemImage}>
            <img src={item.imageUrl} alt={item.title} />
          </div>
        )}
        <h3 className={styles.shopItemTitle}>{item.title}</h3>
        <p className={styles.shopItemDescription}>{item.description}</p>

        {item.effects.note && (
          <div className={styles.shopItemEffects}>
            <span className={styles.shopItemNote}>{item.effects.note}</span>
          </div>
        )}
      </div>

      <div className={styles.shopItemFooter}>
        <button
          className={`${styles.shopItemButton} ${isButtonDisabled ? styles.disabled : ''}`}
          onClick={onPurchase}
          disabled={isButtonDisabled}
        >
          <span>{isPurchasing ? 'Покупка...' : isConsumable ? 'Купить' : 'Забрать'}</span>

          {item.cost > 0 && (
            <span className={`${styles.price} ${!canAfford ? styles.insufficient : ''}`}>
              💰 {item.cost}
            </span>
          )}
        </button>
      </div>

      {!canAfford && item.cost > 0 && (
        <div className={styles.shopItemWarning}>Недостаточно золота</div>
      )}
    </div>
  );
}
