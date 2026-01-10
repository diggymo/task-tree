import React, { useCallback, useRef } from 'react';

interface TaskInputProps {
  taskId: string;
  text: string;
  inputRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>;
  onTextChange: (taskId: string, text: string) => void;
  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    taskId: string,
  ) => void;
  onFocus: (taskId: string) => void;
  onPaste?: (taskId: string, file: File) => void;
  style?: React.CSSProperties;
}

export const TaskInput = React.memo(function TaskInput({
  taskId,
  text,
  inputRefs,
  onTextChange,
  onKeyDown,
  onFocus,
  onPaste,
  style,
}: TaskInputProps) {
  const hiddenDivRef = useRef<HTMLDivElement>(null);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items || !onPaste) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            onPaste(taskId, file);
          }
          return;
        }
      }
    },
    [taskId, onPaste],
  );

  return (
    <div className="task-input-wrapper">
      <div ref={hiddenDivRef} className="task-input-hidden">
        {text || 'タスクを入力...'}
        {'\u200b'}
      </div>
      <textarea
        ref={(el) => {
          if (inputRefs) inputRefs.current[taskId] = el;
        }}
        value={text}
        onChange={(e) => {
          onTextChange(taskId, e.target.value);
          if (hiddenDivRef.current) {
            hiddenDivRef.current.textContent = `${e.target.value}\u200b`;
          }
        }}
        onKeyDown={(e) => onKeyDown(e, taskId)}
        onFocus={() => onFocus(taskId)}
        onPaste={handlePaste}
        placeholder="タスクを入力..."
        className="task-input"
        style={style}
      />
    </div>
  );
});
