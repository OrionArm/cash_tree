import { type CSSProperties, type RefObject } from 'react';
import styles from './world.module.css';
import type { Encounter, EncounterEventType } from '@/services/events/type';

type Props = {
  viewportRef: RefObject<HTMLDivElement | null>;
  worldRef: RefObject<HTMLDivElement | null>;
  worldStyle: CSSProperties;
  encounters: Encounter[];
  playerX: number;
  worldLengthPx: number;
};

const getEncounterTypeClass = (type: EncounterEventType): string => {
  switch (type) {
    case 'npc_encounter':
      return 'npc';
    case 'treasure':
      return 'treasure';
    case 'shop':
      return 'shop';
    default:
      return 'npc';
  }
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
          const typeClass = getEncounterTypeClass(e.type);
          const encounterClass = `${styles.encounter} ${styles[`encounter-${typeClass}`]} ${e.resolved ? styles.resolved : ''}`;
          return (
            <div
              key={e.id}
              className={encounterClass}
              style={{
                left: e.x,
                backgroundImage: `url(${e.imageUrl})`,
              }}
              aria-hidden
            />
          );
        })}
        <div className={styles.ground} style={{ width: worldLengthPx }} />
        <div className={styles.player} style={{ left: playerX }} />
      </div>
    </div>
  );
}
