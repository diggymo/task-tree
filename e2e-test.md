# TaskTree E2Eテスト手順書

このドキュメントはChrome MCP（Claude in Chrome）を使用したE2Eテスト手順を記載しています。

## 前提条件

### 1. 開発サーバーの起動

```bash
cd /Users/morimorikochan/task-management/tasktree
pnpm dev
```

開発サーバーが `http://localhost:1420` で起動していることを確認してください。

### 2. Chrome MCP環境

- Claude in Chrome拡張機能がインストールされていること
- MCPタブグループが利用可能であること

### 3. テスト結果ファイルの作成

テスト結果を保存するファイルを以下コマンドで作成して下さい。

```bash
touch e2e-test-results-$(date +%Y%m%d%H%M%S).md
```

各テストケースが終わったら、このファイルに結果を追記していってください。

---

## テストケース一覧

| ID | テスト名 | 機能カテゴリ |
|----|----------|-------------|
| TC-001 | 初期表示確認 | 基本表示 |
| TC-002 | タスク作成 | タスク管理 |
| TC-003 | タスク完了マーク | タスク管理 |
| TC-004 | タスク削除（ボタン） | タスク管理 |
| TC-005 | Enter - 兄弟タスク追加 | キーボード |
| TC-006 | Tab - 子タスク追加 | キーボード |
| TC-007 | 行頭スペース - 子タスク追加 | キーボード |
| TC-008 | Shift+Tab - 親へフォーカス | キーボード |
| TC-009 | Backspace - 空タスク削除 | キーボード |
| TC-010 | 矢印キー - 兄弟間移動 | キーボード |
| TC-011 | ドラッグ&ドロップ（並び替え） | D&D |
| TC-012 | ドラッグ&ドロップ（子要素化） | D&D |
| TC-013 | ズームイン/アウト（ボタン） | キャンバス |
| TC-014 | ズームリセット | キャンバス |
| TC-015 | パン操作 | キャンバス |
| TC-016 | 自動保存確認 | データ保存 |
| TC-017 | エクスポート/インポートボタン確認 | データ保存 |

---

## テスト手順詳細

### TC-001: 初期表示確認

**目的:** アプリケーションが正しく起動し、基本UIが表示されることを確認

**手順:**

1. タブコンテキストを取得
   ```
   mcp__claude-in-chrome__tabs_context_mcp
   → createIfEmpty: true
   ```

2. 新しいタブを作成
   ```
   mcp__claude-in-chrome__tabs_create_mcp
   ```

3. アプリケーションに移動
   ```
   mcp__claude-in-chrome__navigate
   → url: "http://localhost:1420"
   → tabId: {取得したtabId}
   ```

4. ページ読み込み待機
   ```
   mcp__claude-in-chrome__computer
   → action: "wait"
   → duration: 2
   → tabId: {tabId}
   ```

5. スクリーンショット取得
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

6. ページ構造を確認
   ```
   mcp__claude-in-chrome__read_page
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] タイトル「タスクツリー」が表示される
- [ ] キーボードショートカットのヒントが表示される
- [ ] 初期タスクノードが1つ以上表示される
- [ ] ズームインジケーターが表示される

---

### TC-002: タスク作成

**目的:** タスクのテキスト入力が正しく動作することを確認

**手順:**

1. タスク入力欄を検索
   ```
   mcp__claude-in-chrome__find
   → query: "タスクを入力"
   → tabId: {tabId}
   ```

2. テキストエリアをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {見つかったref}
   → tabId: {tabId}
   ```

3. タスクテキストを入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: "テストタスク1"
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 入力したテキスト「テストタスク1」が表示される
- [ ] タスクノードがフォーカス状態（青い枠線）になる

---

### TC-003: タスク完了マーク

**目的:** タスクの完了/未完了の切り替えが正しく動作することを確認

**手順:**

1. 完了ボタン（チェックボックス）を検索
   ```
   mcp__claude-in-chrome__find
   → query: "complete button checkbox"
   → tabId: {tabId}
   ```

2. 完了ボタンをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {完了ボタンのref}
   → tabId: {tabId}
   ```

3. スクリーンショットで状態確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

4. 再度クリックして未完了に戻す
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {完了ボタンのref}
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 完了時: タスクノードが緑色に変化し、チェックマーク「✓」が表示される
- [ ] 未完了時: 元の色に戻り、チェックマークが消える

---

### TC-004: タスク削除（ボタン）

**目的:** 削除ボタンでタスクが削除されることを確認

**手順:**

1. タスク入力欄をクリックしてフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "タスクを入力 or テストタスク"
   → tabId: {tabId}
   ```

2. フォーカスしてから削除ボタンを検索
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {タスクのref}
   → tabId: {tabId}
   ```

3. 削除ボタン（×）を検索してクリック
   ```
   mcp__claude-in-chrome__find
   → query: "delete button ×"
   → tabId: {tabId}
   ```

4. 削除ボタンをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {削除ボタンのref}
   → tabId: {tabId}
   ```

5. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] タスクが削除され、画面から消える

---

### TC-005: Enter - 兄弟タスク追加

**目的:** Enterキーで新しい兄弟タスクが追加されることを確認

**手順:**

1. 既存タスクにフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "タスク入力欄 textarea"
   → tabId: {tabId}
   ```

2. クリックしてフォーカス
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

3. タスクテキストを入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: "親タスク"
   → tabId: {tabId}
   ```

4. Enterキーを押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "Return"
   → tabId: {tabId}
   ```

5. 新しいタスクにテキスト入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: "兄弟タスク"
   → tabId: {tabId}
   ```

6. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 新しいタスクが直下に追加される
- [ ] 新しいタスクにフォーカスが移動する
- [ ] 両タスクが同じ階層（兄弟関係）に表示される

---

### TC-006: Tab - 子タスク追加

**目的:** Tabキーで子タスクが追加されることを確認

**手順:**

1. 親となるタスクにフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "親タスク"
   → tabId: {tabId}
   ```

2. クリックしてフォーカス
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

3. Tabキーを押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "Tab"
   → tabId: {tabId}
   ```

4. 子タスクにテキスト入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: "子タスク"
   → tabId: {tabId}
   ```

5. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 新しいタスクが子要素として追加される（インデントされる）
- [ ] コネクタ線が親子間に表示される
- [ ] 新しいタスクにフォーカスが移動する

---

### TC-007: 行頭スペース - 子タスク追加

**目的:** 行頭でスペースを入力すると子タスクになることを確認

**手順:**

1. 親となるタスクにフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "タスク入力欄 textarea"
   → tabId: {tabId}
   ```

2. クリックしてフォーカス
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

3. スペースを先頭に付けてテキスト入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: " 子タスク（スペース）"
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 新しいタスクが子要素として追加される
- [ ] 先頭のスペースは削除され、「子タスク（スペース）」のみ表示される

---

### TC-008: Shift+Tab - 親へフォーカス

**目的:** Shift+Tabで親タスクにフォーカスが移動することを確認

**手順:**

1. 子タスクにフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "子タスク"
   → tabId: {tabId}
   ```

2. クリックしてフォーカス
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

3. Shift+Tabを押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "shift+Tab"
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 親タスクにフォーカスが移動する
- [ ] 親タスクノードが青い枠線でハイライトされる

---

### TC-009: Backspace - 空タスク削除

**目的:** 空のタスクでBackspaceを押すと削除されることを確認

**手順:**

1. Enterで新しい空タスクを作成
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "Return"
   → tabId: {tabId}
   ```

2. Backspaceを押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "Backspace"
   → tabId: {tabId}
   ```

3. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 空のタスクが削除される
- [ ] フォーカスが前のタスクまたは親タスクに移動する

---

### TC-010: 矢印キー - 兄弟間移動

**目的:** 上下矢印キーで兄弟タスク間を移動できることを確認

**手順:**

1. 複数の兄弟タスクがある状態を作成（TC-005参照）

2. 最初のタスクにフォーカス
   ```
   mcp__claude-in-chrome__find
   → query: "最初のタスク"
   → tabId: {tabId}
   ```

3. 下矢印を押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "ArrowDown"
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

5. 上矢印を押す
   ```
   mcp__claude-in-chrome__computer
   → action: "key"
   → text: "ArrowUp"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] ↓: 次の兄弟タスクにフォーカスが移動する
- [ ] ↑: 前の兄弟タスクにフォーカスが移動する

---

### TC-011: ドラッグ&ドロップ（並び替え）

**目的:** ドラッグ&ドロップでタスクの順序を変更できることを確認

**手順:**

1. ドラッグハンドル（⋮⋮）を検索
   ```
   mcp__claude-in-chrome__find
   → query: "drag handle"
   → tabId: {tabId}
   ```

2. ドラッグ元の座標を取得してスクリーンショット
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

3. ドラッグ操作を実行
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click_drag"
   → start_coordinate: [ドラッグ元のx, y]
   → coordinate: [ドロップ先のx, y]
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] タスクの順序が変更される
- [ ] ドラッグ中はタスクが半透明になる
- [ ] ドロップ位置にインジケーター（青い線）が表示される

---

### TC-012: ドラッグ&ドロップ（子要素化）

**目的:** タスクを別タスクの子要素としてドロップできることを確認

**手順:**

1. ドラッグ元タスクを特定
   ```
   mcp__claude-in-chrome__find
   → query: "移動したいタスク"
   → tabId: {tabId}
   ```

2. ターゲットタスク（親になるタスク）の中央にドロップ
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click_drag"
   → start_coordinate: [ドラッグ元のx, y]
   → coordinate: [親タスクの中央x, y]
   → tabId: {tabId}
   ```

3. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] タスクが子要素として移動する
- [ ] コネクタ線が表示される
- [ ] ドロップ時にタスクノードがハイライトされる

---

### TC-013: ズームイン/アウト（ボタン）

**目的:** ズームボタンでキャンバスの拡大縮小ができることを確認

**手順:**

1. ズームインボタン（+）を検索
   ```
   mcp__claude-in-chrome__find
   → query: "zoom in button +"
   → tabId: {tabId}
   ```

2. ズームインをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

3. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

4. ズームアウトボタン（-）を検索
   ```
   mcp__claude-in-chrome__find
   → query: "zoom out button -"
   → tabId: {tabId}
   ```

5. ズームアウトをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] ズームイン: キャンバスが拡大され、ズーム率表示が増加する
- [ ] ズームアウト: キャンバスが縮小され、ズーム率表示が減少する

---

### TC-014: ズームリセット

**目的:** リセットボタンでズームが100%に戻ることを確認

**手順:**

1. まずズームを変更（TC-013参照）

2. リセットボタンを検索
   ```
   mcp__claude-in-chrome__find
   → query: "reset button"
   → tabId: {tabId}
   ```

3. リセットをクリック
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click"
   → ref: {ref}
   → tabId: {tabId}
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] ズーム率が100%に戻る
- [ ] キャンバスの位置がリセットされる

---

### TC-015: パン操作

**目的:** Cmd/Ctrl+ドラッグでキャンバスを移動できることを確認

**手順:**

1. スクリーンショットで現在位置を確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

2. Cmd+ドラッグでパン操作
   ```
   mcp__claude-in-chrome__computer
   → action: "left_click_drag"
   → start_coordinate: [400, 300]
   → coordinate: [500, 400]
   → modifiers: "cmd"
   → tabId: {tabId}
   ```

3. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] キャンバス全体が移動する
- [ ] カーソルが「grabbing」に変化する
- [ ] タスクの相対位置は変わらない

---

### TC-016: 自動保存確認

**目的:** データ変更時に自動保存が動作することを確認

**手順:**

1. タスクのテキストを変更
   ```
   mcp__claude-in-chrome__find
   → query: "タスク入力欄"
   → tabId: {tabId}
   ```

2. テキストを入力
   ```
   mcp__claude-in-chrome__computer
   → action: "type"
   → text: "自動保存テスト"
   → tabId: {tabId}
   ```

3. 1-2秒待機
   ```
   mcp__claude-in-chrome__computer
   → action: "wait"
   → duration: 2
   → tabId: {tabId}
   ```

4. 保存インジケーターを確認
   ```
   mcp__claude-in-chrome__find
   → query: "save indicator 保存"
   → tabId: {tabId}
   ```

5. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] 変更後1秒程度で保存インジケーターが「保存中...」→「保存済み」に変化する

---

### TC-017: エクスポート/インポートボタン確認

**目的:** エクスポート・インポートボタンが存在し、クリック可能であることを確認

**手順:**

1. エクスポートボタンを検索
   ```
   mcp__claude-in-chrome__find
   → query: "export button エクスポート"
   → tabId: {tabId}
   ```

2. インポートボタンを検索
   ```
   mcp__claude-in-chrome__find
   → query: "import button インポート"
   → tabId: {tabId}
   ```

3. ページ構造を確認
   ```
   mcp__claude-in-chrome__read_page
   → tabId: {tabId}
   → filter: "interactive"
   ```

4. スクリーンショットで確認
   ```
   mcp__claude-in-chrome__computer
   → action: "screenshot"
   → tabId: {tabId}
   ```

**期待結果:**
- [ ] エクスポートボタンが表示されている
- [ ] インポートボタンが表示されている
- [ ] 両ボタンがクリック可能な状態である

---

## テスト実行時の注意事項

1. **タブIDの取得**: 各テストの開始時に `tabs_context_mcp` でタブIDを確認してください

2. **待機時間**: ページ遷移やアニメーション後は適切な待機時間を設けてください
   ```
   mcp__claude-in-chrome__computer
   → action: "wait"
   → duration: 1
   ```

3. **スクリーンショット**: 各ステップの結果確認にスクリーンショットを活用してください

4. **エラー発生時**: コンソールログを確認してください
   ```
   mcp__claude-in-chrome__read_console_messages
   → tabId: {tabId}
   → onlyErrors: true
   ```

5. **GIF記録**: 複雑な操作はGIF記録で記録すると後から確認しやすくなります
   ```
   mcp__claude-in-chrome__gif_creator
   → action: "start_recording"
   → tabId: {tabId}
   ```

---

## テスト結果記録

| ID | テスト名 | 結果 | 日時 | 備考 |
|----|----------|------|------|------|
| TC-001 | 初期表示確認 | - | - | - |
| TC-002 | タスク作成 | - | - | - |
| TC-003 | タスク完了マーク | - | - | - |
| TC-004 | タスク削除（ボタン） | - | - | - |
| TC-005 | Enter - 兄弟タスク追加 | - | - | - |
| TC-006 | Tab - 子タスク追加 | - | - | - |
| TC-007 | 行頭スペース - 子タスク追加 | - | - | - |
| TC-008 | Shift+Tab - 親へフォーカス | - | - | - |
| TC-009 | Backspace - 空タスク削除 | - | - | - |
| TC-010 | 矢印キー - 兄弟間移動 | - | - | - |
| TC-011 | ドラッグ&ドロップ（並び替え） | - | - | - |
| TC-012 | ドラッグ&ドロップ（子要素化） | - | - | - |
| TC-013 | ズームイン/アウト（ボタン） | - | - | - |
| TC-014 | ズームリセット | - | - | - |
| TC-015 | パン操作 | - | - | - |
| TC-016 | 自動保存確認 | - | - | - |
| TC-017 | エクスポート/インポートボタン確認 | - | - | - |
