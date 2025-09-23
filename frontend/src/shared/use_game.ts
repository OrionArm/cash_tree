import { useEffect, useMemo, useRef, useState } from 'react';
import { preload } from 'react-dom';
import { fetchPlayerState, fetchWorldState, movePlayer } from './api';
import type { PlayerStateResponseDto, GameEventDto, WorldStateResponseDto } from './api';
import { useParallax } from './use_parallax';

export type EncounterType = 'npc' | 'monster' | 'chest';

export type Encounter = {
  id: string;
  x: number; // world position in px
  type: EncounterType;
  resolved: boolean;
  title: string;
  description: string;
};

export const WORLD_LENGTH_PX = 64 * 200; // 200 tiles (fallback)
const STEP_PX = 64; // distance per step
const START_TILES = 6; // start this many tiles from the left edge
const START_X = STEP_PX * START_TILES;

// Функция для конвертации worldState в encounters
const createEncountersFromWorldState = (worldData: WorldStateResponseDto): Encounter[] => {
  return worldData.events
    .filter((event) => event.eventId && event.type !== 'empty')
    .map((event) => ({
      id: event.eventId,
      x: event.position * STEP_PX + START_X,
      type:
        event.type === 'npc_encounter'
          ? ('npc' as const)
          : event.type === 'monster'
            ? ('monster' as const)
            : event.type === 'treasure'
              ? ('chest' as const)
              : ('npc' as const),
      resolved: false,
      title: event.title,
      description: event.description,
    }));
};

export function useGame() {
  const worldRef = useRef<HTMLDivElement>(null!);

  const [playerX, setPlayerX] = useState(START_X);
  const [cameraX, setCameraX] = useState(() => {
    const viewHalf = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const safeMargin = 64 * 3; // SAFE_MARGIN_PX
    return Math.max(START_X, viewHalf + safeMargin);
  });
  const [log, setLog] = useState<string[]>(['Добро пожаловать в приключение!']);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);
  const [stepsCount, setStepsCount] = useState(0);
  const [goldAmount, setGoldAmount] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerStateResponseDto | null>(null);
  const [worldState, setWorldState] = useState<WorldStateResponseDto | null>(null);

  // Вычисляем длину мира в пикселях на основе worldState
  const worldLengthPx = worldState ? worldState.worldLength * STEP_PX : WORLD_LENGTH_PX;

  // Используем хук для параллакса и анимации камеры
  const { viewportRef: parallaxViewportRef } = useParallax({
    playerX,
    worldLengthPx,
    cameraX,
    setCameraX,
  });

  useEffect(() => {
    preload('/open-box.svg', {
      as: 'image',
      fetchPriority: 'low',
    });
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const [playerData, worldData] = await Promise.all([fetchPlayerState(), fetchWorldState()]);
        setPlayerState(playerData);
        setWorldState(worldData);
        setStepsCount(playerData.steps);
        setGoldAmount(playerData.gold);
        setPlayerX(playerData.position * STEP_PX + START_X);

        // Создаем encounters из worldState
        const worldEncounters = createEncountersFromWorldState(worldData);
        setEncounters(worldEncounters);

        setLog((prev) => [...prev, 'Состояние игрока и мира загружено!']);
      } catch (error) {
        setLog((prev) => [...prev, 'Ошибка загрузки данных!']);
        console.error('Failed to fetch initial data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    const nearest = encounters.find((e) => !e.resolved && Math.abs(e.x - playerX) <= STEP_PX / 2);
    if (nearest && !activeEncounterId) {
      setActiveEncounterId(nearest.id);
    }
  }, [playerX, encounters, activeEncounterId]);

  function stepForward() {
    if (activeEncounterId || loading) return;

    setLoading(true);
    movePlayer()
      .then((moveData) => {
        // Обновляем состояние игрока
        setPlayerState(moveData.playerState);
        setStepsCount(moveData.playerState.steps);
        setGoldAmount(moveData.playerState.gold);
        setPlayerX(moveData.newPosition * STEP_PX + START_X);

        // Конвертируем события в встречи
        const newEncounters: Encounter[] = moveData.events.map((event: GameEventDto) => ({
          id: event.id,
          x: moveData.newPosition * STEP_PX + START_X,
          type:
            event.type === 'npc_encounter'
              ? 'npc'
              : event.type === 'monster'
                ? 'monster'
                : event.type === 'treasure'
                  ? 'chest'
                  : 'npc',
          resolved: false,
          title: event.title,
          description: event.description,
        }));

        // Добавляем новые встречи к существующим
        setEncounters((prev) => [...prev, ...newEncounters]);
        setLog((prev) => ['Шаг сделан!', ...prev]);
      })
      .catch((error) => {
        setLog((prev) => ['Ошибка перемещения!', ...prev]);
        console.error('Failed to move player:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function resolveEncounter(action: 'talk' | 'fight' | 'open' | 'ignore') {
    if (!activeEncounterId) return;
    const e = encounters.find((enc) => enc.id === activeEncounterId);
    if (!e) return;
    let outcome = '';
    switch (e.type) {
      case 'npc':
        outcome = action === 'talk' ? 'Вы поговорили и получили подсказку.' : 'Вы прошли мимо.';
        break;
      case 'monster':
        outcome = action === 'fight' ? 'Вы победили и получили опыт.' : 'Вы избежали боя.';
        break;
      case 'chest': {
        const goldFound = 10;
        setGoldAmount((g) => g + goldFound);
        outcome = `Вы нашли немного золота (+${goldFound}).`;
        break;
      }
    }

    // Update local encounters state to mark as resolved
    setEncounters((prev) =>
      prev.map((enc) => (enc.id === e.id ? { ...enc, resolved: true } : enc)),
    );
    // Close modal immediately
    setActiveEncounterId(null);

    setLog((l) =>
      [
        `${e.title}: ${e.description}`,
        `Действие: ${
          action === 'talk'
            ? 'Поговорить'
            : action === 'fight'
              ? 'Сразиться'
              : action === 'open'
                ? 'Открыть'
                : 'Игнорировать'
        } → ${outcome}`,
        ...l,
      ].slice(0, 8),
    );
  }

  const worldStyle = useMemo(
    () =>
      ({
        transform: `translateX(${-cameraX + window.innerWidth / 2}px)`,
      }) as const,
    [cameraX],
  );

  return {
    // refs
    worldRef,
    viewportRef: parallaxViewportRef,
    // state
    playerX,
    cameraX,
    log,
    encounters,
    loading,
    activeEncounterId,
    stepsCount,
    goldAmount,
    playerState,
    worldState,
    // derived
    worldStyle,
    worldLengthPx,
    // actions
    stepForward,
    resolveEncounter,
  } as const;
}
