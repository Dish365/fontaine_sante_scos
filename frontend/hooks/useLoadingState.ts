import { useState, useCallback } from "react";

interface UseLoadingStateReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  setData: (data: T) => void;
  startLoading: () => void;
  stopLoading: (error?: Error) => void;
  executeWithLoading: <R>(
    promise: Promise<R>,
    onSuccess?: (result: R) => void,
    onError?: (error: Error) => void
  ) => Promise<R | undefined>;
}

export function useLoadingState<T = any>(
  initialData: T | null = null
): UseLoadingStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback((err?: Error) => {
    setIsLoading(false);
    if (err) {
      setError(err);
    }
  }, []);

  const executeWithLoading = useCallback(
    async <R>(
      promise: Promise<R>,
      onSuccess?: (result: R) => void,
      onError?: (error: Error) => void
    ): Promise<R | undefined> => {
      startLoading();
      try {
        const result = await promise;
        stopLoading();
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        stopLoading(error);
        onError?.(error);
        return undefined;
      }
    },
    [startLoading, stopLoading]
  );

  return {
    data,
    isLoading,
    error,
    setData,
    startLoading,
    stopLoading,
    executeWithLoading,
  };
}
