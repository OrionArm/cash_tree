import styles from './button.module.css';

type Props = {
  disabled?: boolean;
  onClick: () => void;
  children?: string;
  align?: 'left' | 'right';
  ready?: boolean;
};

export default function Button({
  disabled,
  onClick,
  children = 'Ход',
  align = 'left',
  ready = false,
}: Props) {
  const wrapperClass = align === 'right' ? `${styles.hud} ${styles.hudRight}` : styles.hud;
  const buttonClass = ready ? `${styles.btn} ${styles.ready}` : styles.btn;
  return (
    <div className={wrapperClass}>
      <button className={buttonClass} onClick={onClick} disabled={disabled}>
        {children}
      </button>
    </div>
  );
}
