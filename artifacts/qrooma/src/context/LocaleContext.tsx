import { createContext, useContext, useState, type ReactNode } from "react";
import type { DefaultMode } from "../types";

export type Locale = "ja" | "en";

export interface Translations {
  rooms: string;
  settings: string;
  logout: string;
  newRoom: string;
  roomNamePlaceholder: string;
  cancel: string;
  create: string;
  noRooms: string;
  createFirstRoom: string;
  rename: string;
  startDiscussion: string;
  startDiscussionHint: string;
  messagePlaceholder: string;
  agentsResponding: string;
  sendingAutoRun: string;
  statusCompleted: string;
  statusError: string;
  statusRunning: string;
  statusIdle: string;
  rerun: string;
  runFailed: string;
  runFailedDesc: string;
  runLabel: (n: number) => string;
  structuredDebate: string;
  freeTalk: string;
  conclusion: string;
  keyPoints: string;
  settingsTitle: string;
  settingsDesc: string;
  apiKeys: string;
  apiKeysTempWarningTitle: string;
  apiKeysTempWarningDesc: string;
  defaultMode: string;
  agentConfig: string;
  agentConfigDesc: string;
  provider: string;
  model: string;
  uiLanguage: string;
  loginTab: string;
  signupTab: string;
  loginBtn: string;
  signupBtn: string;
  email: string;
  password: string;
  name: string;
  demoModeTitle: string;
  demoModeDesc: string;
  noMessagesYet: string;
  errorBadge: string;
  debateDesc: string;
  freeTalkDesc: string;
  sideLabel: (s: string) => string;
  toggleSidebar: string;
  rerunDesc: string;
  agentResponding: (name: string) => string;
  agentAndMoreResponding: (name: string) => string;
  finishingUp: string;
  runsCount: (n: number) => string;
  generatedAt: string;
  noConclusionStart: string;
  noConclusionAfterRun: string;
  emptyStateTitle: string;
  emptyStateDesc: string;
  agentCount: string;
  duplicateModelError: string;
  // Free / BYOK mode
  freeMode: string;
  freeModeDesc: string;
  freeModeHint: string;
  byokMode: string;
  // Settings save button
  saveSettings: string;
  settingsSaved: string;
  settingsUnsaved: string;
  // Role labels
  roleLabel: (side: "A" | "B" | "C", mode: DefaultMode) => string;
  roleSubLabel: (side: "A" | "B" | "C") => string;
  // API key / BYOK — basic
  apiKeyNotSet: string;
  apiKeyByokBannerTitle: string;
  apiKeyByokBannerDesc: string;
  apiKeyMissingRunTitle: string;
  apiKeyMissingRunDesc: string;
  goToSettings: string;
  // API key setup — friendly, step-by-step
  apiKeySetupTitle: string;
  apiKeySetupLead: string;
  apiKeySetupSupportText: string;
  apiKeySetupStep1: string;
  apiKeySetupStep2: string;
  apiKeySetupStep3: string;
  apiKeySetupStep4: string;
  getApiKey: string;
  apiKeyNeededWarning: string;
  apiKeyNeededAction: string;
  apiKeySecureNote: string;
  // Product preview (landing page mock UI)
  previewRooms: string;
  previewRoomActive: string;
  previewRoom2: string;
  previewRoom3: string;
  previewMeta: string;
  previewRole1: string;
  previewRole2: string;
  previewRole3: string;
  previewMsg1: string;
  previewMsg2: string;
  previewMsg3: string;
  previewConclusionText: string;
  // Landing page
  landingHero: string;
  landingSubcopy: string;
  landingGetStarted: string;
  landingGoToApp: string;
  landingCard1Title: string;
  landingCard1Body: string;
  landingCard2Title: string;
  landingCard2Body: string;
  landingCard3Title: string;
  landingCard3Body: string;
  landingHowTitle: string;
  landingHowStep1: string;
  landingHowStep1Label: string;
  landingHowStep2: string;
  landingHowStep2Label: string;
  landingHowStep3: string;
  landingHowStep3Label: string;
  landingHowStep4: string;
  landingHowStep4Label: string;
  landingModesTitle: string;
  landingByokTitle: string;
  landingByokLead: string;
  landingByokItem1: string;
  landingByokItem2: string;
  landingByokItem3: string;
  landingByokItem4: string;
  landingFooterCta: string;
  landingNav: string;
  // Pricing section
  pricingTitle: string;
  pricingSub: string;
  pricingFreeLimit: string;
  planFreeDesc: string;
  planFreeFeature1: string;
  planFreeFeature2: string;
  planFreeFeature3: string;
  planFreeFeature4: string;
  planFreeCta: string;
  planConnectBadge: string;
  planConnectDesc: string;
  planConnectFeature1: string;
  planConnectFeature2: string;
  planConnectFeature3: string;
  planConnectFeature4: string;
  planConnectCta: string;
  planProDesc: string;
  planProFeature1: string;
  planProFeature2: string;
  planProFeature3: string;
  planProFeature4: string;
  planProCta: string;
  // Room detail plan banners
  freeModeBanner: string;
  freeUpgradeHint: string;
  // Archive / delete rooms
  archiveRoom: string;
  archivedRooms: string;
  restoreRoom: string;
  deleteRoom: string;
  deleteRoomConfirm: string;
  archivedEmptyState: string;
  // API call errors (room detail)
  errorMissingKeys: string;
  errorAiFailed: string;
  errorAgentSkipped: (side: string) => string;
  // Settings plan overview
  settingsPlanTitle: string;
  settingsPlanFreeDesc: string;
  settingsPlanConnectDesc: string;
  settingsPlanProDesc: string;
  settingsPlanApiKeyDesc: string;
  // Sponsored section (landing page)
  sponsoredLabel: string;
  sponsoredSectionTitle: string;
  sponsoredLearnMore: string;
  // Writing Style settings
  writingStyleSection: string;
  writingToneLabel: string;
  writingToneNatural: string;
  writingToneProfessional: string;
  writingToneConcise: string;
  writingToneCasual: string;
  writingToneNaturalDesc: string;
  writingToneProfessionalDesc: string;
  writingToneConciseDesc: string;
  writingToneCasualDesc: string;
  conclusionFormatLabel: string;
  conclusionFormatParagraph: string;
  conclusionFormatBullets: string;
  jpHardnessLabel: string;
  jpHardnessSoft: string;
  jpHardnessStandard: string;
  jpHardnessFormal: string;
  // Conclusion states
  conclusionLoading: string;
  conclusionError: string;
  conclusionErrorRetry: string;
  conclusionUnresolved: string;
  conclusionUnresolvedDesc: string;
  conclusionContinue: string;
  conclusionProvisional: string;
  conclusionAddCondition: string;
  // Checkpoint / provisional conclusion flow
  provisionalConclusion: string;
  finalConclusion: string;
  endHere: string;
  continueDiscussion: string;
  endHereDesc: string;
  continueDiscussionDesc: string;
  statusCheckpoint: string;
  leadingOption: string;
  conclusionReasoning: string;
  openQuestionsLabel: string;
  clarifyNext: string;
  whatChanged: string;
  provisionalBadge: string;
  finalBadge: string;
  // Clarification flow
  clarifyTitle: string;
  clarifyAnswerBtn: string;
  clarifySkipBtn: string;
  clarifyAssumptionLabel: string;
  clarifyChecking: string;
}

const ja: Translations = {
  rooms: "ルーム",
  settings: "設定",
  logout: "ログアウト",
  newRoom: "新しいルーム",
  roomNamePlaceholder: "例：プロダクト戦略",
  cancel: "キャンセル",
  create: "作成",
  noRooms: "ルームがありません",
  createFirstRoom: "最初のルームを作成してみましょう。",
  rename: "名前を変更",
  startDiscussion: "ディスカッションを開始",
  startDiscussionHint: "メッセージを送信すると、AIチームが議論を始めます。",
  messagePlaceholder: "チームに質問する… (Enter で送信、Shift+Enter で改行)",
  agentsResponding: "AIが回答中…",
  sendingAutoRun: "送信すると自動的に AI が実行されます。",
  statusCompleted: "完了",
  statusError: "エラー",
  statusRunning: "実行中",
  statusIdle: "待機中",
  rerun: "再実行",
  runFailed: "実行に失敗しました",
  runFailedDesc: "一部のエージェントが応答しませんでした。設定でAPIキーを確認してください。",
  runLabel: (n) => `Run ${n}`,
  structuredDebate: "ディベートモード",
  freeTalk: "フリートーク",
  conclusion: "結論",
  keyPoints: "要点",
  settingsTitle: "設定",
  settingsDesc: "変更後に「保存する」ボタンで保存してください。",
  apiKeys: "APIキーの設定",
  apiKeysTempWarningTitle: "一時的な保存",
  apiKeysTempWarningDesc:
    "APIキーは現在ブラウザの localStorage に保存されています。これは仮実装です。本実装ではサーバーサイドで暗号化して保存され、クライアントに平文で返されることはありません。",
  defaultMode: "デフォルトモード",
  agentConfig: "エージェント設定",
  agentConfigDesc: "各サイドにプロバイダーとモデルを割り当てます。A → B → C の順で回答します。",
  provider: "プロバイダー",
  model: "モデル",
  uiLanguage: "UI言語",
  loginTab: "ログイン",
  signupTab: "新規登録",
  loginBtn: "ログイン",
  signupBtn: "アカウントを作成",
  email: "メールアドレス",
  password: "パスワード",
  name: "名前",
  demoModeTitle: "デモモード",
  demoModeDesc: "任意のメールアドレスとパスワードでログインできます。本実装では Supabase Auth を使用します。",
  noMessagesYet: "まだメッセージがありません",
  errorBadge: "エラー",
  debateDesc: "各エージェントが異なる立場を取り議論します。意見の対立からトレードオフが浮かび上がります。",
  freeTalkDesc: "エージェントが制約なく自由に回答します。オープンな探索やブレインストーミングに適しています。",
  sideLabel: (s) => s === "A" ? "提案" : s === "B" ? "検証" : "実行整理",
  toggleSidebar: "サイドバーを切り替え",
  rerunDesc: "同じ質問で再実行 — エージェントが新たに回答します",
  agentResponding: (name) => `${name} が回答中…`,
  agentAndMoreResponding: (name) => `${name} と他1名が回答中…`,
  finishingUp: "まとめ中…",
  runsCount: (n) => `· ${n} 回`,
  generatedAt: "生成日時",
  noConclusionStart: "ディスカッションを開始すると生成されます。",
  noConclusionAfterRun: "実行完了後に表示されます。",
  emptyStateTitle: "ディスカッションを開始",
  emptyStateDesc: "下の入力欄にトピックや質問を入力してください。AIチームがそれぞれの視点で議論します。",
  agentCount: "参加エージェント数",
  duplicateModelError: "同じモデルは複数の枠に設定できません",
  // Free / BYOK mode
  freeMode: "Free モード",
  freeModeDesc: "2エージェント・固定モデルで体験できます",
  freeModeHint: "APIキーなしで試せます。本格利用には設定が必要です。",
  byokMode: "BYOK",
  // Settings save button
  saveSettings: "保存する",
  settingsSaved: "保存しました",
  settingsUnsaved: "未保存の変更があります",
  roleLabel: (side, _mode) => side === "A" ? "提案" : side === "B" ? "検証" : "実行整理",
  roleSubLabel: (side) => side === "A" ? "提案" : side === "B" ? "検証" : "実行整理",
  // API key / BYOK — basic
  apiKeyNotSet: "APIキー未設定",
  apiKeyByokBannerTitle: "APIキーの設定",
  apiKeyByokBannerDesc:
    "QroomaでAIに議論してもらうには、各AIサービスのAPIキーが必要です。APIキーは、そのサービスを使うための「利用キー」のようなものです。",
  apiKeyMissingRunTitle: "APIキーが設定されていません",
  apiKeyMissingRunDesc: "このAIを使うにはAPIキーが必要です。まずは「APIキーを取得」から設定してください。",
  goToSettings: "設定で入力する",
  // API key setup — friendly, step-by-step
  apiKeySetupTitle: "APIキーの設定",
  apiKeySetupLead:
    "QroomaでAIに議論してもらうには、各AIサービスのAPIキーが必要です。APIキーは、そのサービスを使うための「利用キー」のようなものです。一度設定すると、QroomaからそのAIを使って議論を実行できるようになります。",
  apiKeySetupSupportText:
    "「APIキーを取得」を押すと、各サービスの公式ページが開きます。そこでAPIキーを作成し、Qroomaに貼り付けてください。",
  apiKeySetupStep1: "使いたいAIサービスを選ぶ",
  apiKeySetupStep2: "「APIキーを取得」を押して公式ページを開く",
  apiKeySetupStep3: "公式ページでAPIキーを作成してコピーする",
  apiKeySetupStep4: "Qroomaに戻って貼り付ける",
  getApiKey: "APIキーを取得",
  apiKeyNeededWarning: "このAIを使うにはAPIキーが必要です",
  apiKeyNeededAction: "上の「APIキーを取得」から公式ページを開き、キーをコピーして貼り付けてください。",
  apiKeySecureNote: "APIキーはブラウザに安全に保存されます。",
  // Product preview
  previewRooms: "ルーム",
  previewRoomActive: "Q3 プロダクトロードマップ",
  previewRoom2: "価格戦略",
  previewRoom3: "技術スタック検討",
  previewMeta: "3エージェント · Run 2",
  previewRole1: "Builder",
  previewRole2: "Breaker",
  previewRole3: "Operator",
  previewMsg1: "スコープを絞ってリリースし、四半期ごとに再評価する案を提案します。リソース制約を考慮すると現実的な選択肢です。",
  previewMsg2: "問題はリソースだけでなく、成功指標が不明確なことです。指標が決まらない限り、スコープを絞っても優先順位は決まりません。",
  previewMsg3: "北極星指標をひとつ決め、それをスコープ判断の基準にする。採用。残論点：指標の測定方法の確認が必要。",
  previewConclusionText: "採用：北極星指標を先に決定。次アクション：指標の測定方法を確認し、Q3スコープを再定義する。",
  // Landing page
  landingHero: "曖昧なアイデアを、\n実行できる判断に変える。",
  landingSubcopy: "Qroomaは、ひとりで事業をつくる人のために、候補比較・反証・採用/棄却・残論点整理・次アクション化までを支援するAIチームルームです。",
  landingGetStarted: "無料ではじめる",
  landingGoToApp: "アプリを開く",
  landingCard1Title: "候補を比較し、判断の根拠をつくる",
  landingCard1Body: "複数の選択肢を出し、メリット・デメリット・向いている条件を整理。判断しやすい形にまとめます。",
  landingCard2Title: "前提を崩し、リスクを見つける",
  landingCard2Body: "崩れる条件・前提依存・失敗シナリオを明らかにし、見落としに備えることができます。",
  landingCard3Title: "決めたことを実行に渡せる形に",
  landingCard3Body: "採用・棄却・残論点・次アクションを Decision Brief と Task List に整理します。",
  landingHowTitle: "使い方",
  landingHowStep1: "テーマを入力",
  landingHowStep1Label: "判断したいことや比較したい選択肢をそのまま書く。構造化は不要です",
  landingHowStep2: "選択肢を比較・整理",
  landingHowStep2Label: "Builder がメリット・デメリット・向いている条件を複数の視点で整理",
  landingHowStep3: "前提に反証を入れる",
  landingHowStep3Label: "Breaker が崩れる条件・前提依存・失敗シナリオを明らかにする",
  landingHowStep4: "実行に渡す",
  landingHowStep4Label: "Operator が Decision Brief / Task List / Future Consideration を整理",
  landingModesTitle: "3つの専門役割",
  landingByokTitle: "Free / BYOK",
  landingByokLead: "まず APIキーなしで試せます。本格的に使うなら、自分の APIキーで動かせます。",
  landingByokItem1: "Free：APIキー不要・すぐ試せる・2エージェント・固定モデル",
  landingByokItem2: "BYOK：APIキー必要・2 / 3エージェント・モデル選択・実務向け",
  landingByokItem3: "APIキーはサーバーサイドで暗号化保存（本実装）",
  landingByokItem4: "Qrooma の月額プランのみで利用可能",
  landingFooterCta: "今すぐ Qrooma をはじめる",
  landingNav: "Qrooma について",
  // Pricing section
  pricingTitle: "料金プラン",
  pricingSub: "まずは無料ではじめられます。Pro / Connect は近日公開予定。",
  pricingFreeLimit: "無料枠には利用制限があります",
  planFreeDesc: "APIキー不要でマルチロールAIのワークフローを体験できます。",
  planFreeFeature1: "Multi-role AI（Builder / Breaker / Operator）",
  planFreeFeature2: "Decision Brief 出力",
  planFreeFeature3: "1日3回まで",
  planFreeFeature4: "APIキー不要",
  planFreeCta: "無料ではじめる",
  planConnectBadge: "Coming Soon",
  planConnectDesc: "自分のAPIキーで本格利用。モデルや構成を自由に選べます。",
  planConnectFeature1: "自分のAPIキーで利用",
  planConnectFeature2: "2 / 3エージェント選択",
  planConnectFeature3: "モデル選択可",
  planConnectFeature4: "ディベート / フリートーク両対応",
  planConnectCta: "近日公開予定",
  planProDesc: "APIキー不要で本格利用。月30回の議論を含む。",
  planProFeature1: "APIキー不要",
  planProFeature2: "月30回の議論を含む",
  planProFeature3: "超過分は従量課金",
  planProFeature4: "2 / 3エージェント利用可",
  planProCta: "近日公開予定",
  // Settings plan overview
  settingsPlanTitle: "プランについて",
  settingsPlanFreeDesc: "APIキーなしでマルチロールAIを試せます（利用制限あり）",
  settingsPlanConnectDesc: "近日公開予定 — 自分のAPIキーで本格利用",
  settingsPlanProDesc: "近日公開予定 — APIキー不要 · 月30回の議論",
  settingsPlanApiKeyDesc: "現在は Free プランのみ提供中です。Pro / Connect は近日公開予定です。",
  freeModeBanner: "Free · Multi-role AI · Builder / Breaker / Operator",
  freeUpgradeHint: "Pro / Connect は近日公開予定",
  archiveRoom: "アーカイブ",
  archivedRooms: "アーカイブ済み",
  restoreRoom: "戻す",
  deleteRoom: "削除",
  deleteRoomConfirm: "本当に削除しますか？",
  archivedEmptyState: "アーカイブ済みのルームはありません",
  errorMissingKeys: "このエージェントのAPIキーが設定されていません",
  errorAiFailed: "AIの呼び出しに失敗しました",
  errorAgentSkipped: (side) => `${side === "A" ? "提案" : side === "B" ? "検証" : "実行整理"}をスキップしました（APIキーなし）`,
  // Sponsored section
  sponsoredLabel: "スポンサー",
  sponsoredSectionTitle: "おすすめツール",
  sponsoredLearnMore: "詳しく見る",
  // Writing Style settings
  writingStyleSection: "表現設定",
  writingToneLabel: "表現トーン",
  writingToneNatural: "ナチュラル",
  writingToneProfessional: "プロフェッショナル",
  writingToneConcise: "簡潔",
  writingToneCasual: "カジュアル",
  writingToneNaturalDesc: "読みやすく自然な文体（推奨）",
  writingToneProfessionalDesc: "ビジネス向けで整理された表現",
  writingToneConciseDesc: "結論先行・短め・冗長さを削る",
  writingToneCasualDesc: "少しやわらかく、でも軽すぎない",
  conclusionFormatLabel: "結論の形式",
  conclusionFormatParagraph: "段落",
  conclusionFormatBullets: "箇条書き",
  jpHardnessLabel: "日本語の硬さ",
  jpHardnessSoft: "やわらかめ",
  jpHardnessStandard: "標準",
  jpHardnessFormal: "かため",
  // Conclusion states
  conclusionLoading: "結論を生成中…",
  conclusionError: "結論を生成できませんでした",
  conclusionErrorRetry: "もう一度試す",
  conclusionUnresolved: "結論はまだ未確定です",
  conclusionUnresolvedDesc: "争点が残っているため、この時点では確定結論を出していません。",
  conclusionContinue: "議論を続ける",
  conclusionProvisional: "暫定結論を出す",
  conclusionAddCondition: "条件を追加する",
  // Checkpoint / provisional conclusion flow
  provisionalConclusion: "暫定結論",
  finalConclusion: "最終結論",
  endHere: "ここで終える",
  continueDiscussion: "議論を続ける",
  endHereDesc: "この暫定結論を最終版として確定する",
  continueDiscussionDesc: "残論点を踏まえてもう1ラウンド追加する",
  statusCheckpoint: "暫定",
  leadingOption: "有力案",
  conclusionReasoning: "理由",
  openQuestionsLabel: "残論点",
  clarifyNext: "次に詰める点",
  whatChanged: "更新点",
  provisionalBadge: "暫定",
  finalBadge: "確定",
  clarifyTitle: "議論を始める前に、少しだけ確認したいことがあります",
  clarifyAnswerBtn: "回答してから始める",
  clarifySkipBtn: "このまま議論する",
  clarifyAssumptionLabel: "「このまま議論する」を選ぶと、以下の前提で進みます",
  clarifyChecking: "確認中…",
};

const en: Translations = {
  rooms: "Rooms",
  settings: "Settings",
  logout: "Sign out",
  newRoom: "New Room",
  roomNamePlaceholder: "e.g. Product Roadmap Q3",
  cancel: "Cancel",
  create: "Create",
  noRooms: "No rooms yet",
  createFirstRoom: "Create a room to start an async discussion with your AI team.",
  rename: "Rename",
  startDiscussion: "Start the discussion",
  startDiscussionHint: "Send a message and your AI team will start debating.",
  messagePlaceholder: "Ask the team something… (Enter to send, Shift+Enter for newline)",
  agentsResponding: "Agents are responding…",
  sendingAutoRun: "Sending starts a new run automatically.",
  statusCompleted: "Completed",
  statusError: "Error",
  statusRunning: "Running",
  statusIdle: "Idle",
  rerun: "Re-run",
  runFailed: "Run failed",
  runFailedDesc: "One or more agents did not respond. Check that your API keys are set in Settings and try again.",
  runLabel: (n) => `Run ${n}`,
  structuredDebate: "Debate Mode",
  freeTalk: "Free Talk",
  conclusion: "Conclusion",
  keyPoints: "Key points",
  settingsTitle: "Settings",
  settingsDesc: "Make changes, then click Save.",
  apiKeys: "Set up your API keys",
  apiKeysTempWarningTitle: "Temporary storage",
  apiKeysTempWarningDesc:
    "API keys are currently stored in your browser's localStorage. This is a placeholder. In production, keys are encrypted server-side and never exposed to the client.",
  defaultMode: "Default Mode",
  agentConfig: "Agent Configuration",
  agentConfigDesc: "Each side maps to one provider and model. Agents respond in the order A → B → C.",
  provider: "Provider",
  model: "Model",
  uiLanguage: "UI Language",
  loginTab: "Log in",
  signupTab: "Sign up",
  loginBtn: "Log in",
  signupBtn: "Create account",
  email: "Email",
  password: "Password",
  name: "Name",
  demoModeTitle: "Demo mode",
  demoModeDesc:
    "Any email and password works. Auth is not validated in this UI prototype. Supabase Auth replaces this in production.",
  noMessagesYet: "No messages yet",
  errorBadge: "Error",
  debateDesc: "Each agent takes a distinct position and argues it. Trade-offs surface through disagreement.",
  freeTalkDesc: "Agents respond freely without role constraints. Good for open exploration and brainstorming.",
  sideLabel: (s) => s === "A" ? "Builder" : s === "B" ? "Breaker" : "Operator",
  toggleSidebar: "Toggle sidebar",
  rerunDesc: "Same question, new run — agents respond fresh",
  agentResponding: (name) => `${name} is responding…`,
  agentAndMoreResponding: (name) => `${name} and 1 more responding…`,
  finishingUp: "Finishing up…",
  runsCount: (n) => `· ${n} ${n === 1 ? "run" : "runs"}`,
  generatedAt: "Generated",
  noConclusionStart: "Start a discussion to generate one.",
  noConclusionAfterRun: "Will appear after a completed run.",
  emptyStateTitle: "Start the discussion",
  emptyStateDesc: "Post a topic or question below. The AI team will each share their perspective — then you can dig deeper.",
  agentCount: "Number of agents",
  duplicateModelError: "The same model cannot be assigned to multiple sides",
  // Free / BYOK mode
  freeMode: "Free mode",
  freeModeDesc: "2 agents, fixed models — try it out",
  freeModeHint: "Try without API keys. Set keys for full access.",
  byokMode: "BYOK",
  // Settings save button
  saveSettings: "Save changes",
  settingsSaved: "Saved",
  settingsUnsaved: "Unsaved changes",
  roleLabel: (side, _mode) => side === "A" ? "Builder" : side === "B" ? "Breaker" : "Operator",
  roleSubLabel: (side) => side === "A" ? "Builder" : side === "B" ? "Breaker" : "Operator",
  // API key / BYOK — basic
  apiKeyNotSet: "No API key",
  apiKeyByokBannerTitle: "Set up your API keys",
  apiKeyByokBannerDesc:
    "To run discussions in Qrooma, you need API keys from the AI services you want to use. An API key is like a personal access pass — it lets Qrooma call that AI on your behalf.",
  apiKeyMissingRunTitle: "API key required",
  apiKeyMissingRunDesc: 'An API key is needed to use this AI. Click "Get API key" to get one from the official page.',
  goToSettings: "Set up in Settings",
  // API key setup — friendly, step-by-step
  apiKeySetupTitle: "Set up your API keys",
  apiKeySetupLead:
    "To run discussions in Qrooma, you need API keys from the AI services you want to use. An API key is like a personal access pass that lets Qrooma call that AI on your behalf. Once set, Qrooma will use it to run discussions automatically.",
  apiKeySetupSupportText:
    'Click "Get API key" to open the provider\'s official page, create a key there, then come back and paste it into Qrooma.',
  apiKeySetupStep1: "Choose the AI service you want to use",
  apiKeySetupStep2: 'Click "Get API key" to open the official page',
  apiKeySetupStep3: "Create and copy your API key there",
  apiKeySetupStep4: "Come back to Qrooma and paste it here",
  getApiKey: "Get API key",
  apiKeyNeededWarning: "An API key is required to use this AI",
  apiKeyNeededAction: 'Click "Get API key" above to open the official page, copy your key, and paste it here.',
  apiKeySecureNote: "Your API key is stored securely in your browser.",
  // Product preview
  previewRooms: "Rooms",
  previewRoomActive: "Product Roadmap Q3",
  previewRoom2: "Pricing Strategy",
  previewRoom3: "Tech Stack Decision",
  previewMeta: "3 agents · Run 2",
  previewRole1: "Builder",
  previewRole2: "Breaker",
  previewRole3: "Operator",
  previewMsg1: "I'd propose shipping a tighter scope first — prioritize ruthlessly and revisit quarterly. Resource constraints make this the pragmatic path.",
  previewMsg2: "I'd push back. The real issue isn't bandwidth — it's that success criteria are unclear. Without a north star metric, even a trimmed scope drifts.",
  previewMsg3: "Adopted: lock one north star metric first, use it to drive scope decisions. Open question: confirm how the metric will be measured before locking scope.",
  previewConclusionText: "Adopted: define north star metric first. Next action: confirm measurement method and redefine Q3 scope against it.",
  // Landing page
  landingHero: "Turn messy ideas into\nexecutable decisions.",
  landingSubcopy: "Qrooma helps solo founders and business builders compare options, challenge assumptions, decide what to do next, and turn the result into execution-ready briefs and task lists.",
  landingGetStarted: "Start for free",
  landingGoToApp: "Open app",
  landingCard1Title: "Compare options and build a case",
  landingCard1Body: "Surface multiple choices with pros, cons, and fit conditions — so every decision has a real foundation.",
  landingCard2Title: "Challenge assumptions and find risks",
  landingCard2Body: "Expose shaky conditions, hidden dependencies, and failure scenarios before they catch you off guard.",
  landingCard3Title: "Turn decisions into execution",
  landingCard3Body: "Adoption, rejection, open questions, next actions — structured as a Decision Brief and Task List.",
  landingHowTitle: "How it works",
  landingHowStep1: "Input your messy idea",
  landingHowStep1Label: "Write what you want to decide or compare — no need to structure it first",
  landingHowStep2: "Compare options",
  landingHowStep2Label: "Builder surfaces multiple options with pros, cons, and fit conditions",
  landingHowStep3: "Challenge assumptions",
  landingHowStep3Label: "Breaker exposes shaky conditions, hidden dependencies, and failure scenarios",
  landingHowStep4: "Create a handoff",
  landingHowStep4Label: "Operator structures the result into a Decision Brief, Task List, and Future Considerations",
  landingModesTitle: "Three specialized roles",
  landingByokTitle: "Free or BYOK",
  landingByokLead: "Try it first without any API keys. Go further with your own keys.",
  landingByokItem1: "Free: no API keys, instant start, 2 agents, fixed models",
  landingByokItem2: "BYOK: bring your keys, 2/3 agents, model choice, full power",
  landingByokItem3: "API keys are encrypted server-side in production",
  landingByokItem4: "Qrooma charges a flat monthly subscription only",
  landingFooterCta: "Start using Qrooma for free",
  landingNav: "About Qrooma",
  // Pricing section
  pricingTitle: "Pricing",
  pricingSub: "Start free with no API keys. Pro and Connect coming soon.",
  pricingFreeLimit: "Free tier has usage limits",
  planFreeDesc: "Full multi-role AI workflow — no API keys, no commitment.",
  planFreeFeature1: "Multi-role AI (Builder / Breaker / Operator)",
  planFreeFeature2: "Decision Brief output",
  planFreeFeature3: "3 discussions per day",
  planFreeFeature4: "No API keys required",
  planFreeCta: "Start for free",
  planConnectBadge: "Coming Soon",
  planConnectDesc: "Bring your own API keys for full model flexibility and advanced configuration.",
  planConnectFeature1: "Use your own API keys",
  planConnectFeature2: "2 or 3 agents",
  planConnectFeature3: "Choose your models",
  planConnectFeature4: "Advanced handoff and integrations",
  planConnectCta: "Coming soon",
  planProDesc: "Higher usage limits with no API keys needed.",
  planProFeature1: "No API keys required",
  planProFeature2: "30 discussions / month",
  planProFeature3: "Priority execution workflows",
  planProFeature4: "Advanced handoff",
  planProCta: "Coming soon",
  // Settings plan overview
  settingsPlanTitle: "Plans",
  settingsPlanFreeDesc: "Multi-role AI workflow — no API keys needed (usage limits apply)",
  settingsPlanConnectDesc: "Coming soon — bring your own API keys for full access",
  settingsPlanProDesc: "Coming soon — no API keys, 30 discussions / month",
  settingsPlanApiKeyDesc: "Currently only the Free plan is available. Pro and Connect are coming soon.",
  freeModeBanner: "Free · Multi-role AI · Builder / Breaker / Operator",
  freeUpgradeHint: "Pro & Connect coming soon",
  archiveRoom: "Archive",
  archivedRooms: "Archived",
  restoreRoom: "Restore",
  deleteRoom: "Delete",
  deleteRoomConfirm: "Delete this room?",
  archivedEmptyState: "No archived rooms",
  errorMissingKeys: "No API key set for this agent",
  errorAiFailed: "AI call failed",
  errorAgentSkipped: (side) => `${side === "A" ? "Builder" : side === "B" ? "Breaker" : "Operator"} skipped — no API key`,
  // Sponsored section
  sponsoredLabel: "Sponsored",
  sponsoredSectionTitle: "Recommended tools",
  sponsoredLearnMore: "Learn more",
  // Writing Style settings
  writingStyleSection: "Writing Style",
  writingToneLabel: "Tone",
  writingToneNatural: "Natural",
  writingToneProfessional: "Professional",
  writingToneConcise: "Concise",
  writingToneCasual: "Casual",
  writingToneNaturalDesc: "Easy to read, conversational (recommended)",
  writingToneProfessionalDesc: "Organized and polished, not stiff",
  writingToneConciseDesc: "Conclusion-first, short, no padding",
  writingToneCasualDesc: "A little warmer, but still professional",
  conclusionFormatLabel: "Conclusion format",
  conclusionFormatParagraph: "Paragraph",
  conclusionFormatBullets: "Bullet points",
  jpHardnessLabel: "Formality",
  jpHardnessSoft: "Soft",
  jpHardnessStandard: "Standard",
  jpHardnessFormal: "Formal",
  // Conclusion states
  conclusionLoading: "Generating conclusion…",
  conclusionError: "Could not generate a conclusion",
  conclusionErrorRetry: "Try again",
  conclusionUnresolved: "No conclusion yet",
  conclusionUnresolvedDesc: "Key questions remain open. The discussion hasn't reached a clear verdict.",
  conclusionContinue: "Continue discussion",
  conclusionProvisional: "Get provisional conclusion",
  conclusionAddCondition: "Add a condition",
  // Checkpoint / provisional conclusion flow
  provisionalConclusion: "Provisional Conclusion",
  finalConclusion: "Final Conclusion",
  endHere: "End here",
  continueDiscussion: "Continue discussion",
  endHereDesc: "Lock this provisional conclusion as the final answer",
  continueDiscussionDesc: "Add another round to address the open questions",
  statusCheckpoint: "Provisional",
  leadingOption: "Leading Direction",
  conclusionReasoning: "Reasoning",
  openQuestionsLabel: "Open Questions",
  clarifyNext: "Clarify Next",
  whatChanged: "What Changed",
  provisionalBadge: "Provisional",
  finalBadge: "Final",
  clarifyTitle: "Before we start, I'd like to confirm a few things",
  clarifyAnswerBtn: "Answer first",
  clarifySkipBtn: "Start anyway",
  clarifyAssumptionLabel: "\"Start anyway\" will use these assumptions",
  clarifyChecking: "Checking…",
};

const TRANSLATIONS: Record<Locale, Translations> = { ja, en };
const STORAGE_KEY = "qrooma_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "ja",
  setLocale: () => {},
  t: ja,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "ja" ? stored : "ja";
  });

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: TRANSLATIONS[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
