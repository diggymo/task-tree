import React, { useCallback } from 'react';

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
    <textarea
      ref={(el) => {
        if (inputRefs) inputRefs.current[taskId] = el;
      }}
      value={text}
      onChange={(e) => onTextChange(taskId, e.target.value)}
      onKeyDown={(e) => onKeyDown(e, taskId)}
      onFocus={() => onFocus(taskId)}
      onPaste={handlePaste}
      placeholder="タスクを入力..."
      className="task-input"
      rows={1}
      style={style}
    />
  );
});
