import { useState, useEffect } from 'react';
import styles from './chest.module.css';

type Sparkle = { id: number; x: number; y: number; size: number; delay: number };

export default function Chest({
  onClose,
  description,
}: {
  onClose: () => void;
  description: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  // Генерация блесток
  useEffect(() => {
    if (isOpen) {
      const newSparkles = [];
      for (let i = 0; i < 15; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 300,
          y: Math.random() * 200,
          size: Math.random() * 10 + 5,
          delay: Math.random() * 0.5,
        });
      }
      setSparkles(newSparkles);

      const timer = setTimeout(() => setSparkles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleChestClick = () => {
    if (isOpen) {
      onClose();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isOpen ? description : 'Волшебный Сундук с Сокровищами'}</h1>

      <div className={styles.chestContainer}>
        {/* Блестки */}
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className={styles.sparkle}
            style={{
              left: `${sparkle.x}px`,
              top: `${sparkle.y}px`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        ))}

        {/* Сундук */}
        <div className={styles.chestWrapper} onClick={handleChestClick}>
          <img
            src="/open-box.svg"
            alt="Closed chest"
            className={`${styles.chest} ${isOpen ? styles.chestHidden : ''}`}
            loading="eager"
          />
          <img
            src="/open-box.svg"
            alt="Open chest"
            className={`${styles.chest} ${isOpen ? '' : styles.chestHidden}`}
            loading="eager"
          />
        </div>
      </div>

      <div className={styles.instructions}>
        {isOpen ? (
          <p>Нажмите еще раз, чтобы закрыть сундук</p>
        ) : (
          <p>Нажмите на сундук, чтобы открыть его!</p>
        )}
      </div>
    </div>
  );
}
