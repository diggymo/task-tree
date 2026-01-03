# 親タスク進捗表示UI変更計画

## 現状

- 子タスクを持つ親タスクには円形プログレスバー（`CircularProgress`）が表示される
- 位置：inputの右側（`TaskActions`コンポーネント内）
- 表示形式：SVG円弧 + 中央に「2/5」のようなテキスト

## 変更後のUI

**inputの背景が右側から緑色に塗りつぶされる形式**

```
進捗率 0%:
┌──────────────────────────────┐
│ タスクテキスト               │ ← 通常背景
└──────────────────────────────┘

進捗率 40%（2/5完了）:
┌──────────────────────────────┐
│ タスクテキスト       ████████│ ← 右側40%が緑
└──────────────────────────────┘

進捗率 100%:
┌──────────────────────────────┐
│ タスクテキスト               │ ← 全体が緑
└──────────────────────────────┘
```

## 実装手順

### Step 1: TaskNodeのinputスタイル変更

**ファイル**: `src/components/TaskNode/index.tsx`

```typescript
// 親タスクの場合、進捗率に応じた背景グラデーションを設定
const progressBackground = useMemo(() => {
  if (!isParent || !stats) return undefined;

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  if (progress === 0) return undefined;

  // 右側から緑色に塗る（to left方向のグラデーション）
  const greenColor = isCompleted ? '#22c55e' : '#86efac'; // 完了時は濃い緑、途中は薄い緑
  return `linear-gradient(to left, ${greenColor} ${progress}%, transparent ${progress}%)`;
}, [isParent, stats, isCompleted]);
```

inputにインラインスタイルとして適用：
```tsx
<input
  style={{ background: progressBackground }}
  // ... 他のprops
/>
```

### Step 2: TaskActionsからCircularProgressを削除

**ファイル**: `src/components/TaskNode/TaskActions.tsx`

親タスクの場合の表示を変更：
- 円形プログレスバーの代わりに、進捗テキスト「2/5」のみを小さく表示
- または完全に削除してinputの背景だけで進捗を表現

```tsx
{isParent ? (
  <span className="progress-text">{stats!.completed}/{stats!.total}</span>
) : (
  <button className="complete-btn" onClick={handleToggle}>
    {isCompleted ? '✓' : ''}
  </button>
)}
```

### Step 3: スタイル調整

**ファイル**: `src/components/TaskNode/styles.ts`

```css
/* inputの背景グラデーション用 */
.task-node-content input {
  transition: background 0.3s ease;
}

/* 親タスク用の進捗テキスト（オプション） */
.progress-text {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin-left: 8px;
  white-space: nowrap;
}

/* 完了時のテキスト色 */
.progress-text.completed {
  color: #22c55e;
}
```

### Step 4: CircularProgressコンポーネント削除（クリーンアップ）

不要になった以下を削除：
- `CircularProgress` コンポーネント定義
- `CircularProgressProps` 型定義
- 関連するスタイル（`.progress-ring` 等）

## カラーパレット

| 状態 | 背景色 | 説明 |
|------|--------|------|
| 進行中（一部完了） | `#86efac` (green-300) | 薄い緑で進捗を表示 |
| 完全完了 | `#22c55e` (green-500) | 濃い緑で完了を強調 |
| 未着手（0%） | 透明 | 通常のinput背景 |

## 変更ファイル一覧

1. `src/components/TaskNode/index.tsx` - 進捗背景の計算とinputへの適用
2. `src/components/TaskNode/TaskActions.tsx` - CircularProgressを削除し、テキストのみに
3. `src/components/TaskNode/styles.ts` - 不要なスタイル削除、新スタイル追加

## 考慮事項

- **視認性**: 緑背景上でテキストが読みにくくならないよう、透明度調整が必要かも
- **アニメーション**: 進捗変更時に背景がスムーズにアニメーションする
- **モバイル対応**: 既存のレイアウトへの影響を確認
- **ダークモード未対応**: 現状ダークモードはないため考慮不要
