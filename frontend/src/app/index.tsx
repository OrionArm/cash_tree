import styles from './app.module.css';
import LogPanel from '@/features/log_panel';
import EncounterModal from '@/features/encounter_modal';
import HUDStat from '@/features/HUD_stat';
import World from '@/features/world';
import Button from '@/shared/ui/button';
import { useGame } from '@/shared/use_game';

export default function App() {
  const {
    worldRef,
    viewportRef,
    playerX,
    log,
    encounters,
    loading,
    activeEncounterId,
    stepsCount,
    goldAmount,
    worldStyle,
    worldLengthPx,
    stepForward,
    resolveEncounter,
  } = useGame();

  const currentEncounter = activeEncounterId
    ? encounters.find((e) => e.id === activeEncounterId) || null
    : null;

  return (
    <div className={styles.app}>
      <div className={styles['ui-overlay']}>
        <div className={styles['hud-stats']}>
          <HUDStat icon="🦶" label="Ходы" value={stepsCount} align="left" />
          <HUDStat icon="💰" label="Золото" value={goldAmount} align="right" />
        </div>
        <LogPanel lines={log} />
      </div>

      <World
        viewportRef={viewportRef}
        worldRef={worldRef}
        worldStyle={worldStyle}
        encounters={encounters}
        playerX={playerX}
        worldLengthPx={worldLengthPx}
      />

      <Button onClick={stepForward} disabled={!!activeEncounterId || loading} />

      <EncounterModal encounter={currentEncounter} onSelect={resolveEncounter} />
    </div>
  );
}
