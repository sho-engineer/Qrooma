export type Locale = 'ja' | 'en'

export interface Translations {
  // Navigation
  rooms: string
  settings: string
  logout: string
  aiTeamRoom: string

  // Rooms
  newRoom: string
  newRoomTitle: string
  roomName: string
  roomNamePlaceholder: string
  cancel: string
  create: string
  creating: string
  noRooms: string
  createFirstRoom: string
  rename: string
  deleteLabel: string
  deleteRoomConfirm: (name: string) => string
  roomSettings: string

  // Chat
  startDiscussion: string
  startDiscussionHint: string
  messagePlaceholder: string
  send: string
  sendingAutoRun: string

  // Run status
  statusQueued: string
  statusRunning: string
  statusDone: string
  statusFailed: string
  statusIdleBadge: string
  statusRunningBadge: string
  statusDoneBadge: string
  statusErrorBadge: string
  retry: string
  retrying: string
  runFailed: string
  runLabel: (n: number) => string

  // Modes
  structuredDebate: string
  freeTalk: string

  // Conclusion Card
  conclusion: string
  rationale: string
  risks: string
  nextActions: string
  disagreements: string
  unknowns: string

  // Side labels
  sideA: string
  sideB: string
  sideC: string

  // Settings
  settingsTitle: string
  settingsDesc: string
  apiKeys: string
  apiKeysDesc: string
  autoRunOnMessage: string
  autoRunEnabled: string
  autoRunDisabled: string
  uiLanguage: string

  // Save states
  saving: string
  saved: string
  saveFailed: string
}

export const translations: Record<Locale, Translations> = {
  ja: {
    // Navigation
    rooms: 'ルーム',
    settings: '設定',
    logout: 'ログアウト',
    aiTeamRoom: 'AIチームルーム',

    // Rooms
    newRoom: '+ 新しいルーム',
    newRoomTitle: '新しいルーム',
    roomName: 'ルーム名',
    roomNamePlaceholder: '例：プロダクト戦略',
    cancel: 'キャンセル',
    create: '作成',
    creating: '作成中...',
    noRooms: 'まだルームがありません。',
    createFirstRoom: '最初のルームを作成してみましょう。',
    rename: '名前を変更',
    deleteLabel: '削除',
    deleteRoomConfirm: (name) => `"${name}" を削除しますか？`,
    roomSettings: 'ルーム設定',

    // Chat
    startDiscussion: 'ディスカッションを開始',
    startDiscussionHint: 'メッセージを送信すると、AIチームが議論を始めます。',
    messagePlaceholder: 'メッセージを送信してAIディベートを開始... (Enterで送信、Shift+Enterで改行)',
    send: '送信',
    sendingAutoRun: 'メッセージを送信すると自動的にAIが実行されます。',

    // Run status
    statusQueued: 'キュー待ち...',
    statusRunning: 'AIチームが議論中...',
    statusDone: '完了',
    statusFailed: '失敗',
    statusIdleBadge: 'キュー',
    statusRunningBadge: '実行中',
    statusDoneBadge: '完了',
    statusErrorBadge: 'エラー',
    retry: '再実行',
    retrying: '再実行中...',
    runFailed: '実行失敗',
    runLabel: (n) => `Run #${n}`,

    // Modes
    structuredDebate: 'ストラクチャードディベート',
    freeTalk: 'フリートーク',

    // Conclusion Card
    conclusion: '結論',
    rationale: '根拠',
    risks: 'リスク',
    nextActions: '次のアクション',
    disagreements: '対立点',
    unknowns: '未解決事項',

    // Side labels
    sideA: 'サイド A',
    sideB: 'サイド B',
    sideC: 'サイド C',

    // Settings
    settingsTitle: '設定',
    settingsDesc: 'APIキーとデフォルト設定を管理します。',
    apiKeys: 'APIキー（BYOK）',
    apiKeysDesc: 'キーはAES-256-GCMで暗号化されサーバー側にのみ保存されます。クライアントには送信されません。',
    autoRunOnMessage: 'メッセージ時に自動実行',
    autoRunEnabled: '有効 — メッセージ毎にAIが自動実行されます',
    autoRunDisabled: '無効 — 手動実行のみ',
    uiLanguage: 'UI言語',

    // Save states
    saving: '保存中...',
    saved: '保存済み',
    saveFailed: '保存失敗',
  },

  en: {
    // Navigation
    rooms: 'Rooms',
    settings: 'Settings',
    logout: 'Log out',
    aiTeamRoom: 'AI Team Room',

    // Rooms
    newRoom: '+ New room',
    newRoomTitle: 'New room',
    roomName: 'Room name',
    roomNamePlaceholder: 'e.g. Product strategy',
    cancel: 'Cancel',
    create: 'Create',
    creating: 'Creating...',
    noRooms: 'No rooms yet.',
    createFirstRoom: 'Create your first room to get started.',
    rename: 'Rename',
    deleteLabel: 'Delete',
    deleteRoomConfirm: (name) => `Delete "${name}"?`,
    roomSettings: 'Room Settings',

    // Chat
    startDiscussion: 'Start the discussion',
    startDiscussionHint: 'Send a message and your AI team will start debating.',
    messagePlaceholder: 'Send a message to start an AI debate... (Enter to send, Shift+Enter for newline)',
    send: 'Send',
    sendingAutoRun: 'Sending a message automatically starts an AI run.',

    // Run status
    statusQueued: 'Queued...',
    statusRunning: 'AI team is discussing...',
    statusDone: 'Done',
    statusFailed: 'Failed',
    statusIdleBadge: 'Queued',
    statusRunningBadge: 'Running',
    statusDoneBadge: 'Completed',
    statusErrorBadge: 'Error',
    retry: 'Retry',
    retrying: 'Retrying...',
    runFailed: 'Run failed',
    runLabel: (n) => `Run #${n}`,

    // Modes
    structuredDebate: 'Structured Debate',
    freeTalk: 'Free Talk',

    // Conclusion Card
    conclusion: 'Conclusion',
    rationale: 'Rationale',
    risks: 'Risks',
    nextActions: 'Next Actions',
    disagreements: 'Disagreements',
    unknowns: 'Unknowns',

    // Side labels
    sideA: 'Side A',
    sideB: 'Side B',
    sideC: 'Side C',

    // Settings
    settingsTitle: 'Settings',
    settingsDesc: 'Configure API keys and default settings for new rooms.',
    apiKeys: 'API Keys (BYOK)',
    apiKeysDesc: 'Keys are encrypted (AES-256-GCM) and stored server-side only. Never sent to the client.',
    autoRunOnMessage: 'Auto-run on message',
    autoRunEnabled: 'Enabled — AI runs automatically on every message',
    autoRunDisabled: 'Disabled — manual run only',
    uiLanguage: 'UI Language',

    // Save states
    saving: 'Saving...',
    saved: 'Saved',
    saveFailed: 'Save failed',
  },
}

export function getT(locale: Locale): Translations {
  return translations[locale]
}
