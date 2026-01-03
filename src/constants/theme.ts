// デザイントークン: 色
export const colors = {
  // プライマリカラー
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',

  // 背景色
  background: {
    darkest: '#0f172a',
    dark: '#1e293b',
    medium: '#334155',
  },

  // ボーダー色
  border: {
    default: '#475569',
    light: '#64748b',
  },

  // テキスト色
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#64748b',
    white: '#ffffff',
    light: '#e2e8f0',
    lightest: '#f8fafc',
  },

  // 成功・完了
  success: {
    default: '#22c55e',
    light: '#4ade80',
    dark: '#166534',
    darkLight: '#15803d',
  },

  // エラー・削除
  error: {
    default: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },

  // ドラッグオーバー
  dragOver: {
    background: '#1e3a5f',
    backgroundLight: '#2d4a6f',
  },
} as const;

// デザイントークン: スペーシング
export const spacing = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '14px',
  '3xl': '16px',
  '4xl': '20px',
  '5xl': '24px',
  '6xl': '30px',
  '7xl': '32px',
} as const;

// デザイントークン: ボーダーラディウス
export const borderRadius = {
  sm: '2px',
  md: '4px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '50%',
} as const;

// デザイントークン: フォントサイズ
export const fontSize = {
  xs: '9px',
  sm: '11px',
  md: '12px',
  lg: '14px',
  xl: '24px',
} as const;

// デザイントークン: シャドウ
export const shadows = {
  // タスクノード
  taskNode:
    '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  taskNodeHover:
    '0 4px 20px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  taskNodeFocused:
    '0 0 0 3px rgba(59, 130, 246, 0.3), 0 4px 20px rgba(59, 130, 246, 0.3)',
  taskNodeCompletedHover:
    '0 4px 20px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  taskNodeCompletedFocused:
    '0 0 0 3px rgba(34, 197, 94, 0.3), 0 4px 20px rgba(34, 197, 94, 0.3)',

  // ボタン
  deleteButton: '0 2px 8px rgba(239, 68, 68, 0.4)',
} as const;

// デザイントークン: グラデーション
export const gradients = {
  // タスクノード背景
  taskNode: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
  taskNodeCompleted: 'linear-gradient(145deg, #166534 0%, #15803d 100%)',
  taskNodeDragOver: 'linear-gradient(145deg, #1e3a5f 0%, #2d4a6f 100%)',

  // 削除ボタン
  deleteButton: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
  deleteButtonHover: 'linear-gradient(145deg, #f87171 0%, #ef4444 100%)',

  // 背景
  containerBackground:
    'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  headerBackground:
    'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0) 100%)',
} as const;

// デザイントークン: トランジション
export const transitions = {
  default: 'all 0.2s ease',
  fast: 'all 0.1s ease',
  color: 'color 0.2s',
} as const;

// デザイントークン: グリッド
export const grid = {
  size: '40px',
  lineColor: 'rgba(51, 65, 85, 0.3)',
} as const;

// フォントファミリー
export const fontFamily =
  "'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif";
