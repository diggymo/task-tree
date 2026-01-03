import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  shadows,
  gradients,
  transitions,
  fontFamily
} from '../../constants/theme';

export const taskNodeStyles = `
  .task-branch {
    display: flex;
    align-items: flex-start;
  }

  .task-row {
    display: flex;
    align-items: flex-start;
    min-height: 52px;
  }

  .connector {
    display: flex;
    align-items: center;
    width: ${spacing['7xl']};
    height: 52px;
  }

  .connector-svg {
    overflow: visible;
  }

  .children-container {
    display: flex;
    flex-direction: column;
    margin-left: ${spacing['3xl']};
    position: relative;
  }

  .task-node {
    display: flex;
    align-items: flex-start;
    background: ${gradients.taskNode};
    border: 1px solid ${colors.border.default};
    border-radius: ${borderRadius.xl};
    padding: ${spacing.lg} ${spacing['2xl']};
    min-width: 200px;
    max-width: 320px;
    min-height: 44px;
    margin-top: ${spacing.sm};
    box-sizing: border-box;
    position: relative;
    transition: ${transitions.default};
    box-shadow: ${shadows.taskNode};
  }

  .task-node:hover {
    border-color: ${colors.primaryLight};
    box-shadow: ${shadows.taskNodeHover};
  }

  .task-node.focused {
    border-color: ${colors.primary};
    box-shadow: ${shadows.taskNodeFocused};
  }

  .task-node.completed {
    background: ${gradients.taskNodeCompleted};
    border-color: ${colors.success.default};
  }

  .task-node.completed:hover {
    border-color: ${colors.success.light};
    box-shadow: ${shadows.taskNodeCompletedHover};
  }

  .task-node.completed.focused {
    border-color: ${colors.success.default};
    box-shadow: ${shadows.taskNodeCompletedFocused};
  }

  .task-node.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  .task-node.drag-over.drag-before::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${colors.primary};
    border-radius: ${borderRadius.sm};
  }

  .task-node.drag-over.drag-after::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 0;
    right: 0;
    height: 3px;
    background: ${colors.primary};
    border-radius: ${borderRadius.sm};
  }

  .task-node.drag-over.drag-child {
    background: ${gradients.taskNodeDragOver};
    border-color: ${colors.primary};
  }

  .drag-handle {
    cursor: grab;
    color: ${colors.border.light};
    font-size: ${fontSize.md};
    padding-right: ${spacing.md};
    padding-top: ${spacing.sm};
    user-select: none;
    letter-spacing: -2px;
    transition: ${transitions.color};
  }

  .drag-handle:hover {
    color: ${colors.text.secondary};
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .task-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: ${fontSize.lg};
    color: ${colors.text.primary};
    font-family: ${fontFamily};
    min-width: 0;
    resize: none;
    overflow: hidden;
    line-height: 1.5;
    padding: ${spacing.xs} 0;
    field-sizing: content;
  }

  .task-input::placeholder {
    color: ${colors.text.muted};
  }

  .delete-btn {
    position: absolute;
    right: -10px;
    top: -10px;
    width: 24px;
    height: 24px;
    border-radius: ${borderRadius.full};
    background: ${gradients.deleteButton};
    border: 2px solid ${colors.background.dark};
    color: ${colors.text.white};
    font-size: ${fontSize.lg};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${transitions.default};
    box-shadow: ${shadows.deleteButton};
  }

  .delete-btn:hover {
    background: ${gradients.deleteButtonHover};
    transform: scale(1.1);
  }

  .complete-btn {
    width: 20px;
    height: 20px;
    min-width: 20px;
    border-radius: ${borderRadius.md};
    background: transparent;
    border: 2px solid ${colors.border.light};
    color: ${colors.text.white};
    font-size: ${fontSize.md};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: ${transitions.default};
    margin-left: ${spacing.md};
    margin-top: ${spacing.xs};
  }

  .complete-btn:hover {
    border-color: ${colors.success.default};
    background: rgba(34, 197, 94, 0.1);
  }

  .task-node.completed .complete-btn {
    background: ${colors.success.default};
    border-color: ${colors.success.default};
  }

  .complete-btn.parent-task {
    cursor: default;
    opacity: 0.9;
  }

  .complete-btn.parent-task:hover {
    border-color: ${colors.border.light};
    background: transparent;
  }

  .progress-text {
    font-size: ${fontSize.xs};
    font-weight: 700;
    color: ${colors.text.secondary};
    line-height: 1;
  }

  .task-node.completed .progress-text {
    color: ${colors.success.default};
  }
`;
