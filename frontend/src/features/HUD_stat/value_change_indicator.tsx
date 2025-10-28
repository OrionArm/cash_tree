import { useEffect, useState } from 'react';
import styles from './value_change_indicator.module.css';

type Props = {
  value: number | string;
  previousValue: number | string;
  isVisible: boolean;
};

export default function ValueChangeIndicator({ value, previousValue, isVisible }: Props) {
  const [changeValue, setChangeValue] = useState<number | null>(null);
  const [isPositive, setIsPositive] = useState(false);

  useEffect(() => {
    if (isVisible && typeof value === 'number' && typeof previousValue === 'number') {
      const change = value - previousValue;
      if (change !== 0) {
        setChangeValue(change);
        setIsPositive(change > 0);

        const timer = setTimeout(() => {
          setChangeValue(null);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [value, previousValue, isVisible]);

  if (!changeValue) return null;

  return (
    <div className={`${styles.indicator} ${isPositive ? styles.positive : styles.negative}`}>
      {isPositive ? '+' : ''}
      {changeValue}
    </div>
  );
}
