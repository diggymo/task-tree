# GitHub Pages環境でのJSONダウンロード/アップロード機能

## 背景

現在のファイルエクスポート/インポート機能はTauriのネイティブAPI（plugin-dialog, plugin-fs）を使用しています。
GitHub Pages（Web環境）ではこれらのAPIは使用できないため、Web標準のAPIを使った代替実装が必要です。

## 現状の実装

```
useFileStorage.ts
├─ exportToFile() → Tauriのsave()ダイアログ + writeTextFile()
└─ importFromFile() → Tauriのopen()ダイアログ + readTextFile()
```

## 変更方針

### 1. 環境変数をランタイムで使用可能にする

**ファイル**: `vite.config.ts`

```typescript
define: {
  __GITHUB_PAGES__: JSON.stringify(process.env.GITHUB_PAGES === 'true')
}
```

### 2. useFileStorageをWeb対応に修正

**ファイル**: `src/hooks/useFileStorage.ts`

#### exportToFile (Web環境)
```typescript
// Blobを作成してダウンロードリンクを生成
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `task-tree-${new Date().toISOString().slice(0, 10)}.json`;
a.click();
URL.revokeObjectURL(url);
```

#### importFromFile (Web環境)
```typescript
// 非表示のinput[type=file]を動的に作成
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const data = JSON.parse(reader.result as string);
      // バリデーション後にデータを返す
    };
    reader.readAsText(file);
  }
};
input.click();
```

## 実装手順

| Step | ファイル | 内容 |
|------|----------|------|
| 1 | `vite.config.ts` | `define`で`__GITHUB_PAGES__`をランタイムで使用可能に |
| 2 | `src/vite-env.d.ts` | 型定義を追加 |
| 3 | `src/hooks/useFileStorage.ts` | 環境に応じてTauriかWeb APIを使い分け |

## 実装詳細

### Step 1: vite.config.ts

```typescript
export default defineConfig(async () => ({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/task-tree/' : '/',
  define: {
    __GITHUB_PAGES__: JSON.stringify(process.env.GITHUB_PAGES === 'true')
  },
  // ...
}));
```

### Step 2: src/vite-env.d.ts

```typescript
declare const __GITHUB_PAGES__: boolean;
```

### Step 3: useFileStorage.ts

```typescript
const isWebMode = __GITHUB_PAGES__;

export const exportToFile = async (data: SavedData): Promise<boolean> => {
  if (isWebMode) {
    // Web実装
  } else {
    // Tauri実装（既存コード）
  }
};

export const importFromFile = async (): Promise<SavedData | null> => {
  if (isWebMode) {
    // Web実装（Promiseでラップ）
  } else {
    // Tauri実装（既存コード）
  }
};
```

## 注意点

- `saveToAppData`と`loadFromAppData`はWeb環境では使用されない（App.tsxでWeb環境時はスキップされる想定）
- Web環境でのインポートはPromiseでラップしてasync/awaitで使えるようにする
