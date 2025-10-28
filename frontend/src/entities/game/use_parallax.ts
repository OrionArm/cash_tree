import type { DialogNode } from '@/services';
import { useEffect, useCallback, useRef, useState } from 'react';

const CAMERA_SMOOTHNESS = 0.18;
const MANUAL_CAMERA_SMOOTHNESS = 0.12;
const SAFE_MARGIN_PX = 64 * 3;
const STEP_PX = 64;

type UseParallaxProps = {
  playerX: number;
  worldLength: number;
  cameraX: number;
  setCameraX: (value: number | ((prev: number) => number)) => void;
};

type Props = UseParallaxProps & {
  currentDialog?: DialogNode | null;
  loading?: boolean;
};

export function useParallax({
  playerX,
  worldLength,
  cameraX,
  setCameraX,
  currentDialog,
  loading,
}: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isManualControl, setIsManualControl] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [targetCameraX, setTargetCameraX] = useState<number | null>(null);
  const worldLengthPx = worldLength * STEP_PX;

  const updateParallax = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const far = -cameraX * 0.1;
    const near = -cameraX * 0.3;
    vp.style.setProperty('--para-far', `${far}px`);
    vp.style.setProperty('--para-near', `${near}px`);
  }, [cameraX]);

  const animateCamera = useCallback(() => {
    setCameraX((prev) => {
      let target: number;
      let smoothness: number;

      if (isManualControl && targetCameraX !== null) {
        target = targetCameraX;
        smoothness = MANUAL_CAMERA_SMOOTHNESS;
      } else {
        const viewHalf = window.innerWidth / 2;
        const minTarget = viewHalf + SAFE_MARGIN_PX;
        target = Math.max(playerX, minTarget);
        smoothness = CAMERA_SMOOTHNESS;
      }

      const delta = target - prev;
      const next = Math.abs(delta) < 0.5 ? target : prev + delta * smoothness;
      return Math.max(0, Math.min(next, worldLengthPx));
    });
  }, [playerX, worldLengthPx, setCameraX, isManualControl, targetCameraX]);

  const moveCameraLeft = useCallback(() => {
    setIsManualControl(true);
    setTargetCameraX((prev) => {
      const step = STEP_PX * 2;
      const newTarget = prev ? Math.max(0, prev - step) : Math.max(0, cameraX - step);
      return newTarget;
    });
  }, [cameraX]);

  const moveCameraRight = useCallback(() => {
    setIsManualControl(true);
    setTargetCameraX((prev) => {
      const step = STEP_PX * 2;
      const newTarget = prev
        ? Math.min(worldLengthPx, prev + step)
        : Math.min(worldLengthPx, cameraX + step);
      return newTarget;
    });
  }, [cameraX, worldLengthPx]);

  const resetCameraToPlayer = useCallback(() => {
    setIsManualControl(false);
    setTargetCameraX(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentDialog || loading) return;

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          moveCameraLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          moveCameraRight();
          break;
        case ' ':
        case 'Enter':
          event.preventDefault();
          resetCameraToPlayer();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDialog, loading, moveCameraLeft, moveCameraRight, resetCameraToPlayer]);

  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (currentDialog || loading) return;
      const touch = event.touches[0];
      setTouchStartX(touch.clientX);
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (currentDialog || loading || touchStartX === null) return;

      const touch = event.changedTouches[0];
      const touchEndX = touch.clientX;
      const deltaX = touchEndX - touchStartX;
      const threshold = 50;

      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          moveCameraLeft();
        } else {
          moveCameraRight();
        }
      } else {
        resetCameraToPlayer();
      }

      setTouchStartX(null);
    };

    const handleTouchCancel = () => {
      setTouchStartX(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [currentDialog, loading, touchStartX, moveCameraLeft, moveCameraRight, resetCameraToPlayer]);

  useEffect(() => {
    let raf = 0;
    let lastCameraX = cameraX;
    let isAnimating = false;

    const tick = () => {
      animateCamera();

      if (Math.abs(cameraX - lastCameraX) > 0.1) {
        lastCameraX = cameraX;
        isAnimating = true;
        raf = requestAnimationFrame(tick);
      } else {
        isAnimating = false;
        raf = 0;
      }
    };

    const shouldAnimate = (isManualControl || Math.abs(playerX - cameraX) > 1) && !isAnimating;
    if (shouldAnimate) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
  }, [animateCamera, cameraX, playerX, isManualControl]);

  useEffect(() => {
    updateParallax();
  }, [updateParallax]);

  return {
    viewportRef,
    worldLengthPx,
    moveCameraLeft,
    moveCameraRight,
    resetCameraToPlayer,
    isManualControl,
  };
}
