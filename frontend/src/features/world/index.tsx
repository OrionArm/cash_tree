import { type CSSProperties, type RefObject } from 'react';
import styles from './world.module.css';

type EncounterType = 'npc' | 'monster' | 'chest';

type Encounter = {
  id: string;
  x: number;
  type: EncounterType;
  resolved: boolean;
  title: string;
  description: string;
};

type Props = {
  viewportRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  worldStyle: CSSProperties;
  encounters: Encounter[];
  playerX: number;
  worldLengthPx: number;
};

export default function World({
  viewportRef,
  worldRef,
  worldStyle,
  encounters,
  playerX,
  worldLengthPx,
}: Props) {
  return (
    <div ref={viewportRef} className={styles['world-viewport']}>
      <div className={styles.layerFar} />
      <div className={styles.layerNear} />
      <div ref={worldRef} className={styles.world} style={worldStyle}>
        {encounters.map((e) => {
          const encounterClass = `${styles.encounter} ${styles[`encounter-${e.type}`]} ${e.resolved ? styles.resolved : ''}`;
          return <div key={e.id} className={encounterClass} style={{ left: e.x }} aria-hidden />;
        })}
        <div className={styles.ground} style={{ width: worldLengthPx }} />
        <div className={styles.player} style={{ left: playerX }} />
      </div>
    </div>
  );
}
