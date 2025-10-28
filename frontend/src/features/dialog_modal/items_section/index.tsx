import styles from './items_section.module.css';
import type { Item } from '@/services/events/type';

type Props = {
  items: Item[];
  title: string;
};

export default function ItemsSection({ items, title }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={styles.itemsSection}>
      <div className={styles.sectionTitle}>{title}</div>
      {items.length === 1 ? (
        <div className={styles.singleItemContainer}>
          <img src={items[0].image} alt={items[0].name} className={styles.singleItemImage} />
          <span className={styles.singleItemName}>{items[0].name}</span>
        </div>
      ) : (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <span className={styles.itemName}>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
