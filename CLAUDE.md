# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskTree is a Tauri desktop application for visual task management. It combines a React/TypeScript frontend with a Rust backend via Tauri 2.x.

## Common Commands

```bash
pnpm dev          # Start Vite dev server (port 1420)
pnpm build        # TypeScript check + Vite production build
pnpm tauri dev    # Full Tauri development (frontend + Rust backend)
pnpm tauri build  # Create production desktop binary
pnpm validate     # Run biome check (lint + format check)
pnpm fix          # Auto-fix biome errors
```

## Pre-commit Checklist

コミット前に必ず以下を実行してください：

```bash
pnpm validate     # biomeによるlint・フォーマットチェック
pnpm build        # TypeScriptの型チェック + ビルド
```

validateエラーがある場合は `pnpm fix` で自動修正できます。

## Architecture

### Frontend (React + TypeScript)

**App State Machine** (`src/App.tsx`):
- `loading` → `choose` → `ready` phases
- Handles data restoration from AppData on startup

**Core Hooks**:
- `useTaskTree()` - Task CRUD, keyboard navigation, drag-and-drop
- `useCanvasControls()` - Pan/zoom state management
- `useDebouncedSave()` - 1-second debounced auto-save
- `useFileStorage()` - Tauri file I/O integration

**Data Model** (`src/types/task.ts`):
```typescript
TaskRoot { id: 'root', text: string, children: TaskNode[] }
TaskNode { id: string, text: string, children: TaskNode[] }
SavedData { root, viewOffset: {x,y}, zoom, savedAt }
```

**Tree Operations** (`src/utils/taskOperations.ts`):
Pure functions for tree manipulation: `findTask`, `updateTask`, `addChild`, `removeTask`, `insertTaskAt`, `isDescendant`

### Backend (Rust + Tauri)

Minimal backend - primarily Tauri configuration with plugins:
- `plugin-dialog` - Native file dialogs
- `plugin-fs` - File system access
- `plugin-opener` - URL/file opening

### Data Persistence

- Auto-saves to `{AppData}/tasktree-data.json`
- Manual import/export via native file dialogs
- JSON format with validation on import

## Keyboard Shortcuts

- `Enter` - Add sibling task
- `Tab` or leading space - Add child task
- `Shift+Tab` - Focus parent task
- `Backspace` (empty task) - Delete task
- `Arrow Up/Down` - Navigate siblings
- `Cmd/Ctrl+Scroll` - Zoom canvas
- `Cmd/Ctrl+Drag` - Pan canvas

## Conventions

- UI text is in Japanese
- CSS-in-JS via `<style>` tags within components
- React.memo() for TaskNode performance optimization
- useCallback for stable event handler references
