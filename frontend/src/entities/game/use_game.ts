import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchPlayerState,
  fetchWorldState,
  movePlayer,
  getLogs,
  resetPlayerState,
} from '@/shared/local_api';
import type { PlayerStateResponseDto } from '@/services/client_player_service';
import type { DialogNode, Encounter, EncounterInfo, HappenedEffects } from '@/services/events/type';
import { useResourceLoader, type ResourceConfig } from './use_resource_loader';
import { useParallax } from './use_parallax';
import { useDialog } from './use_dialog';

const WORLD_LENGTH = 50;
const STEP_PX = 64;
const START_TILES = 6;
const START_X = STEP_PX * START_TILES;
export const ENERGY_COST_PER_STEP = 6;
export const MAX_POSITION = 36;

const transformEncountersToPixels = (encounters: Encounter[]): Encounter[] => {
  return encounters.map((encounter) => ({
    ...encounter,
    x: encounter.x * STEP_PX + START_X,
  }));
};

const RESOURCES_TO_PRELOAD: ResourceConfig[] = [
  { src: '/player.svg', priority: 'high' },
  { src: '/far.svg', priority: 'high' },
  { src: '/near.svg', priority: 'high' },
];
export function useGame() {
  const worldRef = useRef<HTMLDivElement>(null!);
  const [playerX, setPlayerX] = useState(START_X);
  const [cameraX, setCameraX] = useState(() => {
    const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const safeMargin = STEP_PX * 3;
    return Math.max(START_X, viewHalf + safeMargin);
  });
  const [log, setLog] = useState<string[]>(['Добро пожаловать в приключение!']);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');
  const [currentDialog, setCurrentDialog] = useState<DialogNode | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<EncounterInfo | null>(null);
  const [playerState, setPlayerState] = useState<PlayerStateResponseDto | null>(null);
  const [worldLength, setWorldLength] = useState<number>(WORLD_LENGTH);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [effectsResult, setEffectsResult] = useState<HappenedEffects | undefined>(undefined);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | null>(null);

  const { loading: resourcesLoading, isComplete: resourcesComplete } = useResourceLoader({
    resources: RESOURCES_TO_PRELOAD,
    onProgress: (progress, text) => {
      setLoadingProgress(progress);
      setLoadingText(text);
    },
    onComplete: () => {
      setLoadingProgress(50);
      setLoadingText('Ресурсы загружены');
    },
  });

  const isOverallLoading = loading || resourcesLoading;

  const checkGameStatus = useCallback((playerState: PlayerStateResponseDto) => {
    if (playerState.health <= 0) {
      setGameStatus('lost');
      return true;
    }
    if (playerState.position >= MAX_POSITION) {
      setGameStatus('won');
      return true;
    }
    return false;
  }, []);

  const { viewportRef: parallaxViewportRef, worldLengthPx } = useParallax({
    playerX,
    worldLength,
    cameraX,
    setCameraX,
    currentDialog,
    loading,
  });

  useEffect(() => {
    async function loadInitialData() {
      if (!resourcesComplete) return;

      try {
        setLoading(true);
        setLoadingProgress(60);
        setLoadingText('Загрузка данных игры...');

        const [playerData, worldData, savedLogs] = await Promise.all([
          fetchPlayerState(),
          fetchWorldState(),
          getLogs(5),
        ]);

        setLoadingProgress(80);
        setLoadingText('Настройка мира...');

        setPlayerState(playerData);
        setWorldLength(worldData.worldLength);
        setEncounters(transformEncountersToPixels(worldData.encounters));
        setPlayerX(playerData.position * STEP_PX + START_X);
        checkGameStatus(playerData);

        if (savedLogs.length > 0) {
          const logMessages = savedLogs.map((logEntry) => logEntry.message);
          setLog(['Добро пожаловать в приключение!', ...logMessages]);
        }

        setLoadingProgress(100);
        setLoadingText('Готово!');
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        setLog((prev) => [...prev, 'Ошибка загрузки данных!']);
        console.error('Failed to fetch initial data:', error);
        setLoading(false);
      }
    }
    loadInitialData();
  }, [resourcesComplete, checkGameStatus]);

  const stepForward = useCallback(() => {
    if (currentDialog || loading) return;

    if (!playerState || playerState.energy < ENERGY_COST_PER_STEP) {
      setLog((prev) => [...prev, 'Мало энергии!']);
      return;
    }

    setLoading(true);
    movePlayer()
      .then(({ playerState, dialog, encounter }) => {
        setPlayerState(playerState);
        setPlayerX(playerState.position * STEP_PX + START_X);
        setCurrentDialog(dialog);
        setCurrentEncounter(encounter || null);

        checkGameStatus(playerState);
      })
      .catch((error) => {
        if (error.message.includes('максимальная позиция')) {
          setLog((prev) => [...prev, error.message]);
        } else {
          setLog((prev) => [...prev, 'Ошибка перемещения!']);
        }
        console.error('Failed to move player:', error);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentDialog, loading, playerState, checkGameStatus]);

  const {
    currentDialog: dialog,
    showDialog,
    handleDialogOption,
    handleCloseDialog,
    handleCloseEffectsModal,
    resolveEncounter,
  } = useDialog({
    currentEncounter,
    currentDialog,
    setCurrentDialog,
    setCurrentEncounter,
    setLog,
    setPlayerState,
    setEffectsResult,
  });

  const worldStyle = useMemo(
    () =>
      ({
        transform: `translateX(${-cameraX + (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)}px)`,
      }) as const,
    [cameraX],
  );

  const stableResolveEncounter = useCallback(resolveEncounter, [resolveEncounter]);
  const stableHandleDialogOption = useCallback(handleDialogOption, [handleDialogOption]);
  const stableHandleCloseDialog = useCallback(handleCloseDialog, [handleCloseDialog]);
  const stableHandleCloseEffectsModal = useCallback(handleCloseEffectsModal, [
    handleCloseEffectsModal,
  ]);
  const stableStepForward = useCallback(stepForward, [stepForward]);
  const stableSetCurrentDialog = useCallback(setCurrentDialog, [setCurrentDialog]);

  const resetGame = useCallback(async () => {
    try {
      await resetPlayerState();
      setPlayerState(null);
      setPlayerX(START_X);
      setCameraX(() => {
        const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
        const safeMargin = STEP_PX * 3;
        return Math.max(START_X, viewHalf + safeMargin);
      });
      setLog(['Добро пожаловать в приключение!']);
      setCurrentDialog(null);
      setCurrentEncounter(null);
      setEffectsResult(undefined);
      setEncounters([]);
      setWorldLength(WORLD_LENGTH);
      setGameStatus(null);

      setLoading(true);
      const [playerData, worldData] = await Promise.all([fetchPlayerState(), fetchWorldState()]);

      setPlayerState(playerData);
      setWorldLength(worldData.worldLength);
      setEncounters(transformEncountersToPixels(worldData.encounters));
      setPlayerX(playerData.position * STEP_PX + START_X);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при сбросе игры:', error);
      setLog((prev) => [...prev, 'Ошибка при сбросе игры!']);
    }
  }, []);

  const stableResetGame = useCallback(resetGame, [resetGame]);

  return useMemo(
    () => ({
      worldRef,
      viewportRef: parallaxViewportRef,
      playerX,
      cameraX,
      log,
      currentDialog,
      loading: isOverallLoading,
      loadingProgress,
      loadingText,
      playerState,
      worldLength,
      encounters,
      worldStyle,
      worldLengthPx,
      dialog,
      showDialog,
      effectsResult,
      currentEncounter,
      resolveEncounter: stableResolveEncounter,
      handleDialogOption: stableHandleDialogOption,
      handleCloseDialog: stableHandleCloseDialog,
      handleCloseEffectsModal: stableHandleCloseEffectsModal,
      stepForward: stableStepForward,
      setCurrentDialog: stableSetCurrentDialog,
      resetGame: stableResetGame,
      setPlayerState,
      gameStatus,
    }),
    [
      worldRef,
      parallaxViewportRef,
      playerX,
      cameraX,
      log,
      currentDialog,
      isOverallLoading,
      loadingProgress,
      loadingText,
      playerState,
      worldLength,
      encounters,
      worldStyle,
      worldLengthPx,
      dialog,
      showDialog,
      effectsResult,
      currentEncounter,
      stableResolveEncounter,
      stableHandleDialogOption,
      stableHandleCloseDialog,
      stableHandleCloseEffectsModal,
      stableStepForward,
      stableSetCurrentDialog,
      stableResetGame,
      setPlayerState,
      gameStatus,
    ],
  );
}
