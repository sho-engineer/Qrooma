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

  // Onboarding modal
  onboardingTitle: string
  onboardingWelcome: string
  onboardingBody: string
  onboardingNote: string
  onboardingCta: string
  onboardingLater: string

  // API key info card (Settings)
  apiKeyInfoTitle: string
  apiKeyInfoBYOK: string
  apiKeyInfoRequired: string
  apiKeyInfo3Providers: string
  apiKeyInfoFailed: string
  apiKeyInfoEncrypted: string

  // Agent count selector
  agentCount: string
  agent2: string
  agent3: string
  agent2Desc: string
  agent3Desc: string
  sideDisabled: string

  // Model selector
  aiSides: string
  providerLabel: string
  modelLabel: string
  duplicateModel: string

  // Default mode
  defaultMode: string
  structuredDebateDesc: string
  freeTalkDesc: string

  // API key links
  getApiKey: string
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

    // Onboarding modal
    onboardingTitle: 'Qrooma へようこそ',
    onboardingWelcome: 'AIチームルームへようこそ。まず最初に、AIを動かすためのAPIキーを設定してください。',
    onboardingBody: 'Qrooma は BYOK（Bring Your Own Key）方式です。利用するAIプロバイダーの APIキーをご自身でご用意ください。利用料金は各プロバイダーの契約に基づいて、あなた自身の APIキー経由で発生します。',
    onboardingNote: 'APIキーはサーバーサイドで AES-256-GCM 暗号化して保存されます。クライアントに生値は返されません。',
    onboardingCta: 'APIキーを設定する',
    onboardingLater: 'あとで設定する',

    // API key info card (Settings)
    apiKeyInfoTitle: 'APIキーについて',
    apiKeyInfoBYOK: 'Qrooma は BYOK（Bring Your Own Key）方式です',
    apiKeyInfoRequired: '議論を実行するには APIキーの設定が必要です',
    apiKeyInfo3Providers: 'Structured Debate では 3つの AIサイドに異なるプロバイダーを設定できます',
    apiKeyInfoFailed: '未設定または無効なキーがあると、議論が失敗します',
    apiKeyInfoEncrypted: 'APIキーは AES-256-GCM で暗号化されサーバーにのみ保存されます',

    // Agent count selector
    agentCount: '参加エージェント数',
    agent2: '2エージェント (Side A・B)',
    agent3: '3エージェント (Side A・B・C)',
    agent2Desc: 'Side A と Side B のみ参加します',
    agent3Desc: 'Side A・B・C の3サイドが参加します',
    sideDisabled: 'このサイドは無効です（2エージェント設定）',

    // Model selector
    aiSides: 'AI サイド',
    providerLabel: 'プロバイダー',
    modelLabel: 'モデル',
    duplicateModel: '同じモデルは複数の枠に設定できません',

    // Default mode
    defaultMode: 'デフォルトモード',
    structuredDebateDesc: '初期意見 → 批評 → 改訂 → ジャッジ結論',
    freeTalkDesc: 'AIが自由に議論します。最大3ラウンド。',

    // API key links
    getApiKey: 'APIキーを取得',
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

    // Onboarding modal
    onboardingTitle: 'Welcome to Qrooma',
    onboardingWelcome: 'Welcome to your AI team room. To get started, add your AI provider API keys.',
    onboardingBody: 'Qrooma is BYOK (Bring Your Own Key). Add API keys for the AI providers you want to use. Usage costs are charged directly to your own keys under each provider\'s pricing.',
    onboardingNote: 'Your API keys are encrypted with AES-256-GCM and stored server-side only. The raw key is never returned to the client.',
    onboardingCta: 'Set up API keys',
    onboardingLater: 'Set up later',

    // API key info card (Settings)
    apiKeyInfoTitle: 'About API Keys',
    apiKeyInfoBYOK: 'Qrooma is BYOK (Bring Your Own Key)',
    apiKeyInfoRequired: 'API keys are required to run AI discussions',
    apiKeyInfo3Providers: 'Structured Debate supports different providers for each of the 3 AI sides',
    apiKeyInfoFailed: 'Missing or invalid keys will cause discussions to fail',
    apiKeyInfoEncrypted: 'Keys are encrypted with AES-256-GCM and stored server-side only',

    // Agent count selector
    agentCount: 'Number of agents',
    agent2: '2 agents (Side A & B)',
    agent3: '3 agents (Side A, B & C)',
    agent2Desc: 'Only Side A and Side B participate',
    agent3Desc: 'All three sides A, B & C participate',
    sideDisabled: 'This side is disabled (2-agent mode)',

    // Model selector
    aiSides: 'AI Sides',
    providerLabel: 'Provider',
    modelLabel: 'Model',
    duplicateModel: 'The same model cannot be assigned to multiple sides',

    // Default mode
    defaultMode: 'Default Mode',
    structuredDebateDesc: 'Initial opinions → Critiques → Revisions → Judge conclusion',
    freeTalkDesc: 'AIs take turns discussing freely. Up to 3 rounds.',

    // API key links
    getApiKey: 'Get API key',
  },
}

export function getT(locale: Locale): Translations {
  return translations[locale]
}
