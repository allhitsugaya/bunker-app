'use client';
import { useEffect, useRef } from 'react';

export function usePolling({ dependencies, callbacks, interval = 2500 }) {
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    const ready = dependencies.every(Boolean);
    if (!ready) return;

    const tick = async () => {
      await Promise.allSettled(callbacksRef.current.map(cb => cb()));
    };

    tick();
    const timer = setInterval(tick, interval);

    return () => clearInterval(timer);
  }, dependencies);
}