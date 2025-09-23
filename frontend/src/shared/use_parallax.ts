import { useEffect, useCallback, useRef } from 'react';

const CAMERA_SMOOTHNESS = 0.18; // 0..1 higher is snappier
const SAFE_MARGIN_PX = 64 * 3; // keep at least this much off the left edge

type UseParallaxProps = {
  playerX: number;
  worldLengthPx: number;
  cameraX: number;
  setCameraX: (value: number | ((prev: number) => number)) => void;
};

export function useParallax({ playerX, worldLengthPx, cameraX, setCameraX }: UseParallaxProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Функция для обновления параллакса
  const updateParallax = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const far = -cameraX * 0.1;
    const near = -cameraX * 0.3;
    vp.style.setProperty('--para-far', `${far}px`);
    vp.style.setProperty('--para-near', `${near}px`);
  }, [cameraX]);

  // Функция для анимации камеры
  const animateCamera = useCallback(() => {
    setCameraX((prev) => {
      const viewHalf = window.innerWidth / 2;
      const minTarget = viewHalf + SAFE_MARGIN_PX;
      const target = Math.max(playerX, minTarget);
      const delta = target - prev;
      const next = Math.abs(delta) < 0.5 ? target : prev + delta * CAMERA_SMOOTHNESS;
      return Math.max(0, Math.min(next, worldLengthPx));
    });
  }, [playerX, worldLengthPx, setCameraX]);

  // Анимация камеры
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      animateCamera();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animateCamera]);

  // Обновление параллакса
  useEffect(() => {
    updateParallax();
  }, [updateParallax]);

  return {
    viewportRef,
  };
}
