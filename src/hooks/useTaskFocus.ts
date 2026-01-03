import { useCallback, useRef, useState } from 'react';

export interface UseTaskFocusReturn {
  focusedId: string | null;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
  setFocusedId: React.Dispatch<React.SetStateAction<string | null>>;
  handleFocus: (taskId: string) => void;
  focusTask: (taskId: string) => void;
}

export function useTaskFocus(): UseTaskFocusReturn {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const handleFocus = useCallback((taskId: string) => {
    setFocusedId(taskId);
  }, []);

  const focusTask = useCallback((taskId: string, setCursorToEnd = false) => {
    setFocusedId(taskId);
    setTimeout(() => {
      const input = inputRefs.current[taskId];
      if (input) {
        input.focus();
        if (setCursorToEnd) {
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }
    }, 10);
  }, []);

  return {
    focusedId,
    inputRefs,
    setFocusedId,
    handleFocus,
    focusTask,
  };
}
