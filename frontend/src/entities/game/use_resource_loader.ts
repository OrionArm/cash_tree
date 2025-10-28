import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { preload } from 'react-dom';

type ResourcePriority = 'high' | 'low' | 'auto';

export interface ResourceConfig {
  src: string;
  priority: ResourcePriority;
}

interface UseResourceLoaderOptions {
  resources: ResourceConfig[];
  onProgress?: (progress: number, text: string) => void;
  onComplete?: () => void;
}

interface UseResourceLoaderReturn {
  loading: boolean;
  progress: number;
  loadingText: string;
  loadedResources: Set<string>;
  isComplete: boolean;
}

const globalResourceState = {
  loadedResources: new Set<string>(),
  isComplete: false,
  hasStarted: false,
  preloadedResources: new Set<string>(),
};

export function useResourceLoader({
  resources,
  onProgress,
  onComplete,
}: UseResourceLoaderOptions): UseResourceLoaderReturn {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Инициализация...');
  const [loadedResources, setLoadedResources] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedRef = useRef(false);
  const updateProgressRef = useRef<() => void>(() => {});

  const memoizedResources = useMemo(() => resources, [resources]);

  const memoizedOnComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const updateProgress = () => {
    if (globalResourceState.isComplete) {
      return;
    }

    const currentLoaded = loadedResources.size;
    const totalResources = resources.length;
    const newProgress = Math.round((currentLoaded / totalResources) * 100);

    setProgress(newProgress);

    const highPriorityResources = resources.filter((r) => r.priority === 'high');
    const loadedHighPriority = highPriorityResources.filter((r) =>
      loadedResources.has(r.src),
    ).length;

    let newLoadingText: string;
    if (loadedHighPriority < highPriorityResources.length) {
      newLoadingText = `Загрузка критических ресурсов... ${loadedHighPriority}/${highPriorityResources.length}`;
    } else if (currentLoaded < totalResources) {
      newLoadingText = `Загрузка дополнительных ресурсов... ${currentLoaded}/${totalResources}`;
    } else {
      newLoadingText = 'Все ресурсы загружены';
    }

    setLoadingText(newLoadingText);

    if (onProgress) {
      onProgress(newProgress, newLoadingText);
    }

    if (currentLoaded === totalResources) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setIsComplete(true);
      setLoading(false);
      globalResourceState.isComplete = true;
      memoizedOnComplete();
    }
  };

  updateProgressRef.current = updateProgress;

  // Инициализация загрузки ресурсов
  useEffect(() => {
    // Предотвращаем повторную инициализацию
    if (hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    // Если загрузка уже завершена глобально, сразу возвращаем результат
    if (globalResourceState.isComplete) {
      setLoadedResources(new Set(globalResourceState.loadedResources));
      setProgress(100);
      setLoadingText('Все ресурсы загружены');
      setLoading(false);
      setIsComplete(true);
      memoizedOnComplete();
      return;
    }

    if (memoizedResources.length === 0) {
      setLoading(false);
      setIsComplete(true);
      globalResourceState.isComplete = true;
      return;
    }

    // Если загрузка уже началась, ждем завершения
    if (globalResourceState.hasStarted) return;

    globalResourceState.hasStarted = true;

    // Загружаем только те ресурсы, которые еще не загружены и не были предзагружены
    const resourcesToPreload = memoizedResources.filter(
      (resource) =>
        !globalResourceState.loadedResources.has(resource.src) &&
        !globalResourceState.preloadedResources.has(resource.src),
    );

    resourcesToPreload.forEach((resource) => {
      preload(resource.src, {
        as: 'image',
        fetchPriority: resource.priority,
      });
      globalResourceState.preloadedResources.add(resource.src);
    });

    const preloadPromises = memoizedResources
      .filter((resource) => !globalResourceState.loadedResources.has(resource.src))
      .map((resource) => {
        return new Promise<void>((resolve) => {
          // Проверяем, не загружен ли ресурс уже в браузере
          const img = new Image();
          img.onload = () => {
            globalResourceState.loadedResources.add(resource.src);
            setLoadedResources((prev) => new Set([...prev, resource.src]));
            resolve();
          };
          img.onerror = () => {
            globalResourceState.loadedResources.add(resource.src);
            setLoadedResources((prev) => new Set([...prev, resource.src]));
            resolve();
          };

          if (img.complete) {
            globalResourceState.loadedResources.add(resource.src);
            setLoadedResources((prev) => new Set([...prev, resource.src]));
            resolve();
            return;
          }

          img.src = resource.src;
        });
      });

    // Если все ресурсы уже загружены, сразу завершаем
    if (preloadPromises.length === 0) {
      setLoadedResources(new Set(globalResourceState.loadedResources));
      setProgress(100);
      setLoadingText('Все ресурсы загружены');
      setLoading(false);
      setIsComplete(true);
      globalResourceState.isComplete = true;
      memoizedOnComplete();
      return;
    }

    // Запускаем интервал обновления прогресса с увеличенным интервалом
    progressIntervalRef.current = setInterval(() => {
      if (!globalResourceState.isComplete && updateProgressRef.current) {
        updateProgressRef.current();
      }
    }, 500);

    Promise.all(preloadPromises)
      .then(() => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        setProgress(100);
        setLoadingText('Все ресурсы загружены');
        setLoading(false);
        setIsComplete(true);
        globalResourceState.isComplete = true;
        memoizedOnComplete();
      })
      .catch((error) => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        console.warn('Некоторые ресурсы не удалось загрузить:', error);
        setProgress(100);
        setLoadingText('Ресурсы загружены');
        setLoading(false);
        setIsComplete(true);
        globalResourceState.isComplete = true;
        memoizedOnComplete();
      });

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [memoizedResources, memoizedOnComplete]);

  return {
    loading,
    progress,
    loadingText,
    loadedResources,
    isComplete,
  };
}
