import type { PlayerRanking } from '@/shared/types';
import styles from './leaderboard.module.css';

type Props = {
  players: PlayerRanking[];
};

export default function Leaderboard({ players }: Props) {
  const topPlayers = players.slice(0, 7);

  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.title}>🏆 Топ-7 игроков</h3>
      <div className={styles.playersList}>
        {topPlayers.map((player, index) => (
          <div key={player.id} className={styles.playerRow}>
            <div className={styles.rank}>
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `#${index + 1}`}
            </div>
            <div className={styles.playerInfo}>
              <div className={styles.playerName}>{player.name}</div>
              <div className={styles.playerStats}>
                <span className={styles.stat}>💰 {player.gold}</span>
                <span className={styles.stat}>💎 {player.cristal}</span>
                <span className={styles.stat}>🦶 {player.position}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
