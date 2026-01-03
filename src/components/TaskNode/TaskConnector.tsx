import React from 'react';

interface TaskConnectorProps {
  isFirst: boolean;
  isLast: boolean;
}

export const TaskConnector = React.memo(function TaskConnector({
  isFirst,
  isLast,
}: TaskConnectorProps) {
  return (
    <div className="connector">
      <svg
        width="32"
        height="52"
        className="connector-svg"
        role="presentation"
        aria-hidden="true"
      >
        {!isFirst && (
          <line x1="0" y1="0" x2="0" y2="26" stroke="#64748b" strokeWidth="2" />
        )}
        {!isLast && (
          <line
            x1="0"
            y1="26"
            x2="0"
            y2="52"
            stroke="#64748b"
            strokeWidth="2"
          />
        )}
        <line x1="0" y1="26" x2="32" y2="26" stroke="#64748b" strokeWidth="2" />
        <circle cx="32" cy="26" r="3" fill="#3b82f6" />
      </svg>
    </div>
  );
});
