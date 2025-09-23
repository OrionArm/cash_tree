import styles from './HUD_stat.module.css';

type Props = {
  icon: string;
  label: string;
  value: number | string;
  align?: 'left' | 'right';
  className?: string;
};

export default function HUDStat({ icon, label, value, align = 'left', className }: Props) {
  const alignClass = align === 'left' ? styles.left : styles.right;
  return (
    <div className={`${styles.item} ${alignClass} ${className ?? ''}`}>
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <span className={styles.text}>
        {label}: {value}
      </span>
    </div>
  );
}
