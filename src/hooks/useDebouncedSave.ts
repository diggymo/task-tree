import { useState, useRef, useCallback } from 'react';
import type { SavedData, SaveStatus } from '../types/task';
import { saveToAppData } from './useFileStorage';

const DEBOUNCE_DELAY = 1000;

export function useDebouncedSave() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback((data: SavedData) => {
    setSaveStatus('pending');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const dataToSave: SavedData = {
          ...data,
          savedAt: new Date().toISOString()
        };
        const success = await saveToAppData(dataToSave);
        setSaveStatus(success ? 'saved' : 'error');
      } catch (e) {
        console.error('Failed to save:', e);
        setSaveStatus('error');
      }
    }, DEBOUNCE_DELAY);
  }, []);

  const cancelSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    saveStatus,
    scheduleSave,
    cancelSave,
    setSaveStatus
  };
}
