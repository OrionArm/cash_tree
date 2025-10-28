import styles from './game.module.css';
import LogPanel from '@/features/log_panel';
import DialogModal from '@/features/dialog_modal';
import HUDStat from '@/features/HUD_stat';
import World from '@/features/world';
import Button from '@/shared/ui/button';
import { useGameContext } from '@/entities/game/use_game_context';
import { ENERGY_COST_PER_STEP, MAX_POSITION } from '@/entities/game/use_game';

export default function GamePage() {
  const {
    worldRef,
    viewportRef,
    playerX,
    currentDialog,
    log,
    loading,
    playerState,
    worldStyle,
    worldLengthPx,
    encounters,
    dialog,
    showDialog,
    effectsResult,
    handleDialogOption,
    handleCloseDialog,
    handleCloseEffectsModal,
    stepForward,
    currentEncounter,
    resolveEncounter,
  } = useGameContext();

  return (
    <div className={styles.game}>
      <div className={styles.gameContent}>
        <div className={styles['ui-overlay']}>
          <div className={styles['hud-stats']}>
            <HUDStat icon="🦶" label="Ходы" value={playerState?.position || 0} align="left" />
            <HUDStat
              icon="❤️"
              label="Здоровье"
              value={`${playerState?.health || 0}/${playerState?.maxHealth || 100}`}
              align="left"
            />
            <HUDStat icon="⚡" label="Энергия" value={playerState?.energy || 0} align="left" />
            <HUDStat
              icon="/gold-dollar-coin.svg"
              label="Золото"
              value={playerState?.gold || 0}
              align="left"
              iconType="svg"
            />
            <HUDStat icon="💎" label="Кристаллы" value={playerState?.cristal || 0} align="left" />
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

        <Button
          onClick={stepForward}
          disabled={!!currentDialog || loading || (playerState?.position || 0) >= MAX_POSITION}
          ready={
            !currentDialog &&
            !loading &&
            (playerState?.energy || 0) >= ENERGY_COST_PER_STEP &&
            (playerState?.position || 0) < MAX_POSITION
          }
        >
          {(playerState?.position || 0) >= MAX_POSITION
            ? 'Финиш'
            : (playerState?.energy || 0) < ENERGY_COST_PER_STEP
              ? 'Мало энергии'
              : 'Ход'}
        </Button>

        <DialogModal
          dialog={dialog}
          showDialog={showDialog}
          effectsResult={effectsResult}
          onSelectOption={handleDialogOption}
          onClose={handleCloseDialog}
          onCloseEffects={handleCloseEffectsModal}
          onSelect={resolveEncounter}
          currentEncounter={currentEncounter}
        />
      </div>
    </div>
  );
}
