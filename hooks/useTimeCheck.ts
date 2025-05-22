import { useEffect, useState } from 'react';
import { betterFetch } from '@better-fetch/fetch';

type TimeData = {
  time: string;
  isPassed: boolean;
} | null;

export function useTimeCheck() {
  const [time, setTime] = useState<TimeData>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTime() {
      try {
        setIsLoading(true);
        const { data } = await betterFetch<TimeData>('/api/time-check');
        setTime(data);
      } catch (err) {
        console.error('Error fetching time:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch time'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchTime();
  }, []);

  console.log("Time",time);

  return { time, isLoading, error };
}
