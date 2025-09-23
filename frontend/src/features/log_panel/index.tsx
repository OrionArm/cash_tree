import styles from './log_panel.module.css';

type Props = {
  lines: string[];
};

export default function LogPanel({ lines }: Props) {
  return (
    <div className={`${styles.log} ${lines.length > 3 ? styles.logFade : ''}`}>
      {lines.map((line, i) => (
        <div className={styles.logLine} key={i}>
          {line}
        </div>
      ))}
    </div>
  );
}
