# TaskTree リファクタリング計画

## 概要

保守性・変更容易性の観点からコードベースを分析し、以下のリファクタリング計画を策定しました。

**現在の技術的負債スコア: 6.5/10** ⚠️

---

## 優先度別の課題一覧

### 🔴 CRITICAL（必須対応）

#### 1. useTaskTree Hook の分割（316行 → 複数の小さなHook）

**現状の問題:**
- `handleKeyDown` だけで118行
- 6種類のキーボードショートカット処理が1つの関数に混在
- `setTimeout` がクリーンアップなしで7箇所で使用（メモリリークの可能性）
- `root` への依存により不要な再レンダリングが発生

**リファクタリング案:**
```
src/hooks/
├── useTaskTree.ts          # 統合フック（エントリポイント）
├── useTaskKeyboard.ts      # キーボード操作（NEW）
├── useTaskDragDrop.ts      # ドラッグ&ドロップ（NEW）
├── useTaskCRUD.ts          # タスクのCRUD操作（NEW）
└── useTaskFocus.ts         # フォーカス管理（NEW）
```

**期待効果:**
- 各Hookが単一責任を持つ
- テスト容易性の向上
- 依存関係の明確化

---

#### 2. TaskNode コンポーネントの分割（356行 → 複数コンポーネント）

**現状の問題:**
- コンポーネントロジック、インラインスタイル、SVG描画が混在
- 11個のイベントハンドラをprops経由で受け取る（Prop Drilling）
- 120行以上のCSS-in-JS

**リファクタリング案:**
```
src/components/
├── TaskNode/
│   ├── index.tsx           # メインコンポーネント
│   ├── TaskInput.tsx       # テキスト入力部分
│   ├── TaskConnector.tsx   # 接続線SVG
│   ├── TaskActions.tsx     # ボタン群（完了、削除）
│   ├── TaskChildren.tsx    # 子タスクレンダリング
│   └── styles.ts           # スタイル定義
```

**期待効果:**
- コンポーネントの再利用性向上
- テスト容易性の向上
- スタイルの一元管理

---

#### 3. App.tsx の状態管理改善

**現状の問題:**
- 5つの `useState` が関連データを個別管理
- `loading → choose → ready` のフェーズ遷移が明示的でない
- データ管理とUI状態が混在

**リファクタリング案:**

```typescript
// 方法1: useReducer による状態統合
type AppState =
  | { phase: 'loading' }
  | { phase: 'choose'; savedData: SavedData | null }
  | { phase: 'ready'; currentData: TaskRoot; initialData: TaskRoot };

// 方法2: カスタムHook抽出
const useAppDataLoader = () => {
  // データ読み込みロジックを分離
};
```

**期待効果:**
- 状態遷移の明確化
- バグ発生リスクの低減

---

### 🟠 HIGH（優先対応）

#### 4. Prop Drilling の解消

**現状の問題:**
- TaskNode に11個のイベントハンドラを渡している
- 再帰的にすべての子コンポーネントに同じpropsを伝播

**リファクタリング案:**
```typescript
// TaskContext.tsx
const TaskContext = createContext<TaskOperations | null>(null);

export const TaskProvider: React.FC = ({ children }) => {
  const operations = useTaskTree();
  return (
    <TaskContext.Provider value={operations}>
      {children}
    </TaskContext.Provider>
  );
};

// useTaskContext.ts
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('TaskProvider required');
  return context;
};
```

**期待効果:**
- コンポーネントのprops簡素化
- 変更時の影響範囲縮小

---

#### 5. デザイントークンの導入

**現状の問題:**
- 同じ色が50箇所以上でハードコード
- 一貫性のないスペーシング（2px, 4px, 8px, 10px, 12px...）
- `@keyframes spin` が複数コンポーネントで重複定義

**リファクタリング案:**
```typescript
// src/constants/theme.ts
export const colors = {
  primary: '#3b82f6',
  background: {
    dark: '#0f172a',
    medium: '#1e293b',
  },
  border: '#475569',
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
  },
  success: '#22c55e',
  error: '#ef4444',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
} as const;
```

**期待効果:**
- テーマ変更の容易化
- 視覚的一貫性の向上

---

#### 6. エラーハンドリングの強化

**現状の問題:**
- ほとんどの関数がエラーを握りつぶしている
- ユーザーへのフィードバックが不十分
- カスタムエラー型がない

**リファクタリング案:**
```typescript
// src/types/errors.ts
export class TaskTreeError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public recoverable: boolean = true
  ) {
    super(message);
  }
}

// src/hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const [error, setError] = useState<TaskTreeError | null>(null);

  const handleError = useCallback((err: unknown) => {
    const taskError = err instanceof TaskTreeError
      ? err
      : new TaskTreeError('予期しないエラーが発生しました', 'UNKNOWN');
    setError(taskError);
    // トースト表示などのUI処理
  }, []);

  return { error, handleError, clearError };
};
```

---

#### 7. テストインフラの構築

**現状の問題:**
- テストファイルが0個
- テストランナーの設定なし

**リファクタリング案:**
```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event jsdom
```

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

**優先的にテストすべきファイル:**
1. `taskOperations.ts` - 純粋関数のためテストが容易
2. `urlDetection.ts` - 正規表現パターンの検証
3. `useTaskTree.ts` - 複雑なロジックの動作保証

---

### 🟡 MEDIUM（改善推奨）

#### 8. マジックナンバーの定数化

**現状の問題点と対応:**
```typescript
// 現在
Math.max(0.25, Math.min(2, zoom))  // ズーム制限
rect.height / 3  // ドラッグ閾値
1000  // デバウンス遅延

// 改善後（src/constants/config.ts）
export const ZOOM = {
  MIN: 0.25,
  MAX: 2,
  STEP: 0.1,
} as const;

export const DRAG = {
  THRESHOLD_RATIO: 1/3,
} as const;

export const TIMING = {
  DEBOUNCE_SAVE_MS: 1000,
  ANIMATION_DURATION_MS: 200,
} as const;
```

---

#### 9. 日本語テキストの国際化対応準備

**現状のハードコード箇所:**
- "新しいタスク" (task.ts)
- "タスクを入力..." (TaskNode.tsx)
- "保存済み", "未保存" (SaveIndicator.tsx)
- "復元しますか？" (RestoreDialog.tsx)

**リファクタリング案:**
```typescript
// src/constants/i18n.ts
export const ja = {
  task: {
    placeholder: 'タスクを入力...',
    newTask: '新しいタスク',
  },
  save: {
    saved: '保存済み',
    unsaved: '未保存',
    saving: '保存中...',
  },
  dialog: {
    restoreTitle: '前回のデータを復元しますか？',
    restore: '復元',
    newStart: '新規作成',
  },
} as const;
```

---

#### 10. 型定義の整理

**現状の問題:**
- `SlackMessagePreview` が型名とコンポーネント名で重複
- `TaskNodeProps` が35行と冗長

**リファクタリング案:**
```typescript
// 型名の明確化
export interface SlackMessagePreviewData { ... }  // 型
export const SlackMessagePreview: React.FC<...>   // コンポーネント

// TaskNodePropsの分割
interface TaskNodeBaseProps {
  task: TaskNode;
  depth: number;
  isRoot: boolean;
}

interface TaskNodeCallbacks {
  onTextChange: (id: string, text: string) => void;
  onAddSibling: (id: string) => void;
  // ...
}

type TaskNodeProps = TaskNodeBaseProps & TaskNodeCallbacks;
```

---

### 🟢 LOW（将来対応）

#### 11. パフォーマンス最適化

- ツリー探索関数のメモ化
- 大規模データ対応（1000+タスク）
- 仮想スクロールの検討

#### 12. アクセシビリティ改善

- ARIAラベルの追加
- キーボードナビゲーションの文書化
- フォーカス管理の改善

---

## 実装ロードマップ

### Phase 1: 基盤整備（1-2週間）
- [ ] 定数ファイルの作成（colors, spacing, config）
- [ ] エラーハンドリング基盤の構築
- [ ] Vitestの導入と初期テスト作成

### Phase 2: Hook分割（2-3週間）
- [ ] useTaskKeyboard の抽出
- [ ] useTaskDragDrop の抽出
- [ ] useTaskCRUD の抽出
- [ ] 各Hookのテスト作成

### Phase 3: コンポーネント分割（2-3週間）
- [ ] TaskContext の導入
- [ ] TaskNode の分割
- [ ] スタイルの一元化

### Phase 4: 品質向上（継続的）
- [ ] テストカバレッジの拡大
- [ ] アクセシビリティ対応
- [ ] パフォーマンス計測と最適化

---

## まとめ

このリファクタリング計画は、以下の原則に基づいています：

1. **単一責任の原則** - 各モジュールは1つの責任のみを持つ
2. **DRY原則** - 重複を排除し、変更を1箇所に集約
3. **テスト可能性** - 副作用を分離し、純粋関数を増やす
4. **段階的改善** - 既存機能を壊さずに少しずつ改善

リファクタリングは一度に行うのではなく、機能開発と並行して段階的に実施することを推奨します。
