import styles from './button.module.css';

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children?: string;
  align?: 'left' | 'right';
};

export default function Button({ disabled, onClick, children = 'Ход', align = 'left' }: Props) {
  const wrapperClass = align === 'right' ? `${styles.hud} ${styles.hudRight}` : styles.hud;
  return (
    <div className={wrapperClass}>
      <button className={styles.btn} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </div>
  );
}
