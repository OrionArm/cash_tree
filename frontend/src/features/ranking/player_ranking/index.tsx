import type { PlayerRanking } from '@/shared/types';
import styles from './player_ranking.module.css';

type Props = {
  currentPlayer: PlayerRanking;
  nearbyPlayers: PlayerRanking[];
  currentPlayerRank: number;
};

export default function PlayerRanking({ currentPlayer, nearbyPlayers, currentPlayerRank }: Props) {
  return (
    <div className={styles.playerRanking}>
      <h3 className={styles.title}>📊 Ваш рейтинг</h3>

      <div className={styles.currentPlayerCard}>
        <div className={styles.rank}>#{currentPlayerRank}</div>
        <div className={styles.playerInfo}>
          <div className={styles.playerName}>{currentPlayer.name}</div>
          <div className={styles.playerStats}>
            <span className={styles.stat}>💰 {currentPlayer.gold}</span>
            <span className={styles.stat}>💎 {currentPlayer.cristal}</span>
            <span className={styles.stat}>🦶 {currentPlayer.position}</span>
          </div>
        </div>
        <div className={styles.currentPlayerBadge}>Вы</div>
      </div>

      <div className={styles.nearbyPlayers}>
        <h4 className={styles.nearbyTitle}>Соседние игроки</h4>
        {nearbyPlayers.length > 0 ? (
          <div className={styles.nearbyList}>
            {nearbyPlayers.map((player) => (
              <div key={player.id} className={styles.nearbyPlayerRow}>
                <div className={styles.rank}>
                  {player.position < currentPlayer.position ? '⬆️' : '⬇️'}
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
        ) : (
          <div className={styles.emptyNearby}>
            <p>Нет соседних игроков для отображения</p>
            <p>Debug: nearbyPlayers.length = {nearbyPlayers.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
