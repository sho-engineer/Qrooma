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
  // Landing page v2 — new sections
  landingEyebrow: string;
  landingHeroLine1: string;
  landingHeroLine2: string;
  landingSubcopyV2: string;
  landingProblemEyebrow: string;
  landingProblemTitle: string;
  landingProblemItem1Title: string;
  landingProblemItem1Body: string;
  landingProblemItem2Title: string;
  landingProblemItem2Body: string;
  landingProblemItem3Title: string;
  landingProblemItem3Body: string;
  landingHowV2Title: string;
  landingHowV2Step1Title: string;
  landingHowV2Step1Body: string;
  landingHowV2Step2Title: string;
  landingHowV2Step2Body: string;
  landingHowV2Step3Title: string;
  landingHowV2Step3Body: string;
  landingHowV2Step4Title: string;
  landingHowV2Step4Body: string;
  landingMemoEyebrow: string;
  landingMemoTitle: string;
  landingMemoSub: string;
  landingPositioningTitle: string;
  landingPositioningSub: string;
  landingUseCasesTitle: string;
  landingUseCasesSub: string;
  landingFooterCtaV2: string;
  landingFooterSub: string;
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
  // Handoff panel
  handoffDecisionBrief: string;
  handoffTaskList: string;
  handoffFutureConsiderations: string;
  handoffTaskCount: (n: number) => string;
  handoffFutureCount: (n: number) => string;
  handoffCopyBrief: string;
  handoffCopyTasks: string;
  handoffCopyAll: string;
  handoffCopyGenericAI: string;
  handoffCopyBuild: string;
  handoffCopied: string;
  handoffNoFuture: string;
  handoffNoTasks: string;
  // Invite code
  inviteCodeTitle: string;
  inviteCodeDesc: string;
  inviteCodePlaceholder: string;
  inviteCodeApply: string;
  inviteCodeApplied: string;
  inviteCodeSuccess: string;
  inviteCodeInvalid: string;
  inviteCodeAlreadyApplied: string;
  inviteCodeNetworkError: string;
  inviteCodeNote: string;
  // Usage limits
  usageTodayRemaining: (used: number, limit: number) => string;
  usageMonthly: (used: number, limit: number) => string;
  usageUnlimited: string;
  usageFairUse: string;
  usageLimitDayReached: string;
  usageLimitMonthReached: string;
  usageContinuationLimit: string;
  // Room status
  roomStatusInReview: string;
  roomStatusCompleted: string;
  roomStatusArchived: string;
  flagFutureConsideration: string;
  flagTasks: string;
  flagHandoff: string;
  // Decision type
  decisionTypeLabel: string;
  decisionTypeMvpScope: string;
  decisionTypeFeaturePriority: string;
  decisionTypeLpCopy: string;
  decisionTypeImplementation: string;
  decisionTypePricing: string;
  decisionTypeOther: string;
  decisionTypeSelectPlaceholder: string;
  // Project layer
  projectLabel: string;
  projectNew: string;
  projectNamePlaceholder: string;
  projectNoProject: string;
  projectSelect: string;
  projectCreate: string;
  projectArchive: string;
  projectArchivedLabel: string;
  projectDeleteConfirm: string;
  // Decision Memo card
  decisionMemoTitle: string;
  decisionMemoDecision: string;
  decisionMemoBackground: string;
  decisionMemoReasoning: string;
  decisionMemoAxes: string;
  decisionMemoConditions: string;
  decisionMemoDoNow: string;
  decisionMemoNotNow: string;
  decisionMemoFuture: string;
  decisionMemoNeedsConfirmation: string;
  decisionMemoNextActions: string;
  decisionMemoReferencedMemos: string;
  decisionMemoCopy: string;
  decisionMemoCopied: string;
  decisionMemoAxisEval: (axis: string) => string;
  decisionMemoPriority: (p: string) => string;
  decisionMemoHumanReview: string;
  // Handoff copy 4 types
  handoffCopyDecisionMemo: string;
  handoffCopyTaskList2: string;
  handoffCopyGenericAI2: string;
  handoffCopyBuildPrompt: string;
  // Generation status
  generationStatusBuilder: string;
  generationStatusBreaker: string;
  generationStatusOperator: string;
  generationStatusConclusion: string;
  // Settings sections
  settingsSectionAccount: string;
  settingsSectionDisplay: string;
  settingsSectionInvite: string;
  settingsSectionPlan: string;
  settingsDensityLabel: string;
  settingsDensityCompact: string;
  settingsDensityComfortable: string;
  // Empty state with decision type
  emptyStateWithType: (type: string) => string;
  // Room creation modal
  roomModeTitle: string;
  roomModeConsult: string;
  roomModeConsultDesc: string;
  roomModeDecide: string;
  roomModeDecideDesc: string;
  tabTitleGenerating: string;
  tabTitleDone: string;
  useProjectContextLabel: string;
  useProjectContextDesc: string;
  newRoomDecisionTypeLabel: string;
  // ── Feedback page ──────────────────────────────────────────────────────────
  feedbackPageTitle: string;
  feedbackPageSub: string;
  feedbackSuggestBtn: string;
  feedbackAllStatuses: string;
  feedbackMostVoted: string;
  feedbackNewest: string;
  feedbackPinnedSection: string;
  feedbackCommunitySection: string;
  feedbackEmpty: string;
  feedbackLoadError: string;
  feedbackVotesNeededLabel: string;
  feedbackNotePrefix: string;
  feedbackPinnedBadge: string;
  feedbackCostSensitive: string;
  feedbackWaitlistNudge: string;
  feedbackJoinWaitlistLink: string;
  feedbackBackToRooms: string;
  feedbackLoginLink: string;
  feedbackJoinWaitlistBtn: string;
  feedbackVoteModalTitle: string;
  feedbackVoteModalBody: string;
  feedbackVoteEmailPlaceholder: string;
  feedbackCancelBtn: string;
  feedbackVoteSubmitBtn: string;
  feedbackVotingBtn: string;
  feedbackEmailRequired: string;
  feedbackVoteError: string;
  feedbackSubmitModalTitle: string;
  feedbackTitleLabel: string;
  feedbackTitlePlaceholder: string;
  feedbackDescLabel: string;
  feedbackDescPlaceholder: string;
  feedbackCategoryLabel: string;
  feedbackSubmitBtn: string;
  feedbackSubmittingBtn: string;
  feedbackTitleDescRequired: string;
  feedbackLoginRequired: string;
  feedbackRemoveVote: string;
  feedbackUpvoteBtn: string;
  feedbackCatFeatureRequest: string;
  feedbackCatImprovement: string;
  feedbackCatBug: string;
  feedbackCatIntegration: string;
  feedbackCatPricing: string;
  feedbackCatOther: string;
  feedbackStatusUnderReview: string;
  feedbackStatusPlanned: string;
  feedbackStatusInProgress: string;
  feedbackStatusReleased: string;
  feedbackStatusNotPlanned: string;
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
    "AdjudoでAIに議論してもらうには、各AIサービスのAPIキーが必要です。APIキーは、そのサービスを使うための「利用キー」のようなものです。",
  apiKeyMissingRunTitle: "APIキーが設定されていません",
  apiKeyMissingRunDesc: "このAIを使うにはAPIキーが必要です。まずは「APIキーを取得」から設定してください。",
  goToSettings: "設定で入力する",
  // API key setup — friendly, step-by-step
  apiKeySetupTitle: "APIキーの設定",
  apiKeySetupLead:
    "AdjudoでAIに議論してもらうには、各AIサービスのAPIキーが必要です。APIキーは、そのサービスを使うための「利用キー」のようなものです。一度設定すると、AdjudoからそのAIを使って議論を実行できるようになります。",
  apiKeySetupSupportText:
    "「APIキーを取得」を押すと、各サービスの公式ページが開きます。そこでAPIキーを作成し、Adjudoに貼り付けてください。",
  apiKeySetupStep1: "使いたいAIサービスを選ぶ",
  apiKeySetupStep2: "「APIキーを取得」を押して公式ページを開く",
  apiKeySetupStep3: "公式ページでAPIキーを作成してコピーする",
  apiKeySetupStep4: "Adjudoに戻って貼り付ける",
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
  landingSubcopy: "Adjudoは、ひとりで事業をつくる人のために、候補比較・反証・採用/棄却・残論点整理・次アクション化までを支援するAI Decision Roomです。",
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
  landingByokItem4: "Adjudo の月額プランのみで利用可能",
  landingFooterCta: "今すぐ Adjudo をはじめる",
  landingNav: "Adjudo について",
  // Landing page v2 — new sections (JA)
  landingEyebrow: "AI Decision Room",
  landingHeroLine1: "曖昧な思考を、",
  landingHeroLine2: "明確な判断に変える。",
  landingSubcopyV2: "ひとりで事業をつくる人のために。選択肢を比較し、前提を崩し、決める。判断を一枚のメモにまとめ、実行ツールに渡せる形にします。",
  landingProblemEyebrow: "問題",
  landingProblemTitle: "AIは考える助けをしてくれる。\nでも「考えた」は「決めた」ではない。",
  landingProblemItem1Title: "ひとつのAIでは視野が狭い",
  landingProblemItem1Body: "ひとつのAIとの往復になりがち。アイデアは出るが、反証や比較がなく、判断の質が上がらない。",
  landingProblemItem2Title: "探索しても着地しない",
  landingProblemItem2Body: "選択肢を並べても、「結局どれにするか」が決まらない。議論がそのまま終わる。",
  landingProblemItem3Title: "実行ツールへの引き渡しが曖昧",
  landingProblemItem3Body: "ChatGPT や Claude に何を伝えればいいかわからない。決めたことが構造化されていないから。",
  landingHowV2Title: "比較、検証、決定、引き渡し。",
  landingHowV2Step1Title: "比較する",
  landingHowV2Step1Body: "Builder が複数の選択肢とメリット・デメリット・向いている条件を整理します。",
  landingHowV2Step2Title: "前提を崩す",
  landingHowV2Step2Body: "Breaker が仮定の弱点、隠れた依存関係、失敗シナリオを明らかにします。",
  landingHowV2Step3Title: "判断を構造化する",
  landingHowV2Step3Body: "Operator が結論を整理。今やる / 今やらない / 後で検討 / 要検証 に分類します。",
  landingHowV2Step4Title: "実行に渡す",
  landingHowV2Step4Body: "Decision Memo、タスクリスト、AIへのプロンプトをそのまま使える形で出力します。",
  landingMemoEyebrow: "アウトプット",
  landingMemoTitle: "判断が、一枚のメモになる。",
  landingMemoSub: "ChatGPT、Claude、Manus、Replit、Cursor に渡せる構造化されたアウトプット。",
  landingPositioningTitle: "思考と実行の間にある層。",
  landingPositioningSub: "Adjudo は汎用AIでも、PMツールでも、議事録ツールでもありません。判断を構造化する専用の層です。",
  landingUseCasesTitle: "プロダクトを前進させる判断のために。",
  landingUseCasesSub: "MVPスコープ、機能優先度、料金設計、LP訴求、実装方針、ツール選定。判断が必要なあらゆる場面で。",
  landingFooterCtaV2: "最初の Decision Room を作る。",
  landingFooterSub: "APIキー不要ですぐ使えます。",
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
  // Handoff panel
  handoffDecisionBrief:       "Decision Brief",
  handoffTaskList:             "タスクリスト",
  handoffFutureConsiderations: "将来検討",
  handoffTaskCount:   (n) => `${n}件`,
  handoffFutureCount: (n) => `${n}件`,
  handoffCopyBrief:  "Decision Briefをコピー",
  handoffCopyTasks:  "Task Listをコピー",
  handoffCopyAll:    "まとめてコピー",
  handoffCopyGenericAI: "汎用AIプロンプトをコピー",
  handoffCopyBuild:     "実装用プロンプトをコピー",
  handoffCopied:     "コピーしました",
  handoffNoFuture:   "現時点では将来検討事項はありません",
  handoffNoTasks:    "タスクが見つかりません",
  // Invite code
  inviteCodeTitle:          "招待コード",
  inviteCodeDesc:           "招待コードをお持ちの場合は入力してください。テスター・Early Accessユーザーとして登録されます。",
  inviteCodePlaceholder:    "コードを入力",
  inviteCodeApply:          "適用",
  inviteCodeApplied:        "招待コードが適用済みです",
  inviteCodeSuccess:        "招待コードを適用しました！",
  inviteCodeInvalid:        "招待コードが無効です。コードをご確認ください。",
  inviteCodeAlreadyApplied: "招待コードはすでに適用されています。",
  inviteCodeNetworkError:   "接続エラーが発生しました。もう一度お試しください。",
  inviteCodeNote:           "招待コードはテスターやEarly Accessプログラムへの参加を示すものです。1アカウントにつき1回のみ適用できます。",
  // Usage limits
  usageTodayRemaining: (used, limit) => `本日の残り: ${limit - used} / ${limit}`,
  usageMonthly:        (used, limit) => `Fair use: 月${used} / ${limit}回`,
  usageUnlimited:      "無制限利用",
  usageFairUse:        "Fair use: 月100回まで",
  usageLimitDayReached:     "本日のFree利用回数に達しました。明日またお試しください。",
  usageLimitMonthReached:   "今月のFree利用上限に達しました。",
  usageContinuationLimit:   "Freeプランでは、継続議論は1回まで利用できます。",
  // Room status
  roomStatusInReview:       "検討中",
  roomStatusCompleted:      "結論済み",
  roomStatusArchived:       "アーカイブ済み",
  flagFutureConsideration:  "将来検討あり",
  flagTasks:                "タスクあり",
  flagHandoff:              "引き継ぎあり",
  // Decision type
  decisionTypeLabel:        "決断タイプ",
  decisionTypeMvpScope:     "MVPスコープ",
  decisionTypeFeaturePriority: "新機能優先順位",
  decisionTypeLpCopy:       "LP訴求",
  decisionTypeImplementation: "実装方針",
  decisionTypePricing:      "価格プラン",
  decisionTypeOther:        "その他",
  decisionTypeSelectPlaceholder: "決断タイプを選択",
  // Project layer
  projectLabel:             "プロジェクト",
  projectNew:               "新しいプロジェクト",
  projectNamePlaceholder:   "例：SaaSプロダクトv1",
  projectNoProject:         "プロジェクトなし",
  projectSelect:            "プロジェクトを選択",
  projectCreate:            "プロジェクトを作成",
  projectArchive:           "アーカイブ",
  projectArchivedLabel:     "アーカイブ済み",
  projectDeleteConfirm:     "このプロジェクトを削除しますか？",
  // Decision Memo card
  decisionMemoTitle:        "Decision Memo",
  decisionMemoDecision:     "採用した判断",
  decisionMemoBackground:   "背景",
  decisionMemoReasoning:    "採用理由",
  decisionMemoAxes:         "比較軸評価",
  decisionMemoConditions:   "判断が変わる条件",
  decisionMemoDoNow:        "今やる",
  decisionMemoNotNow:       "今回やらない",
  decisionMemoFuture:       "後で検討",
  decisionMemoNeedsConfirmation: "追加確認が必要",
  decisionMemoNextActions:  "次アクション",
  decisionMemoReferencedMemos: "参照した過去の判断",
  decisionMemoCopy:         "コピー",
  decisionMemoCopied:       "コピー済み",
  decisionMemoAxisEval:     (axis: string) => axis,
  decisionMemoPriority:     (p: string) => p === "high" ? "高" : p === "medium" ? "中" : "低",
  decisionMemoHumanReview:  "要人間確認",
  // Handoff copy 4 types
  handoffCopyDecisionMemo:  "Decision Memo をコピー",
  handoffCopyTaskList2:     "タスクリストをコピー",
  handoffCopyGenericAI2:    "汎用AIプロンプトをコピー",
  handoffCopyBuildPrompt:   "実装プロンプトをコピー",
  // Generation status
  generationStatusBuilder:  "Builder 提案中…",
  generationStatusBreaker:  "Breaker 検証中…",
  generationStatusOperator: "Operator 整理中…",
  generationStatusConclusion: "まとめ生成中…",
  // Settings sections
  settingsSectionAccount:   "アカウント",
  settingsSectionDisplay:   "表示設定",
  settingsSectionInvite:    "招待コード",
  settingsSectionPlan:      "プラン",
  settingsDensityLabel:     "表示密度",
  settingsDensityCompact:   "コンパクト",
  settingsDensityComfortable: "標準",
  // Empty state with decision type
  emptyStateWithType:       (type: string) => `${type} の決断を始めましょう`,
  // Room creation modal
  roomModeTitle:            "どう始めますか？",
  roomModeConsult:          "軽く相談する",
  roomModeConsultDesc:      "まだ考えがまとまっていないテーマを、壁打ちしながら整理します。",
  roomModeDecide:           "意思決定する",
  roomModeDecideDesc:       "比較・反証・判断理由を整理し、Decision Memoまで作成します。",
  tabTitleGenerating:       "生成中",
  tabTitleDone:             "完了",
  useProjectContextLabel:   "同じProject内の過去Decision Memoを参照する",
  useProjectContextDesc:    "同一Project内の過去の判断（最大5件）をAIのコンテキストとして渡します。",
  newRoomDecisionTypeLabel: "何を決めますか？（任意）",
  // ── Feedback page ──────────────────────────────────────────────────────────
  feedbackPageTitle: "Adjudoをより良くしよう",
  feedbackPageSub: "次に作ってほしい機能に投票するか、Adjudoをより役立てるための提案をしてください。",
  feedbackSuggestBtn: "提案する",
  feedbackAllStatuses: "すべてのステータス",
  feedbackMostVoted: "人気順",
  feedbackNewest: "新着順",
  feedbackPinnedSection: "ピン留め — あなたの意見が重要",
  feedbackCommunitySection: "コミュニティリクエスト",
  feedbackEmpty: "まだフィードバックがありません。最初に投稿しましょう！",
  feedbackLoadError: "フィードバックを読み込めませんでした。もう一度お試しください。",
  feedbackVotesNeededLabel: "優先化に必要な投票数",
  feedbackNotePrefix: "メモ：",
  feedbackPinnedBadge: "ピン留め",
  feedbackCostSensitive: "コスト影響あり",
  feedbackWaitlistNudge: "Adjudoのリリース通知を受け取りますか？",
  feedbackJoinWaitlistLink: "ウェイトリストに参加 →",
  feedbackBackToRooms: "← ルーム",
  feedbackLoginLink: "ログイン",
  feedbackJoinWaitlistBtn: "ウェイトリストに参加",
  feedbackVoteModalTitle: "メールアドレスを入力して投票",
  feedbackVoteModalBody: "メールアドレスは重複投票の防止のみに使用します。公開されることはありません。",
  feedbackVoteEmailPlaceholder: "your@email.com",
  feedbackCancelBtn: "キャンセル",
  feedbackVoteSubmitBtn: "投票する",
  feedbackVotingBtn: "投票中…",
  feedbackEmailRequired: "メールアドレスを入力してください。",
  feedbackVoteError: "エラーが発生しました。",
  feedbackSubmitModalTitle: "Adjudoへの機能提案",
  feedbackTitleLabel: "タイトル",
  feedbackTitlePlaceholder: "例：Notion連携を追加したい",
  feedbackDescLabel: "詳細",
  feedbackDescPlaceholder: "解決したい課題や改善点を記入してください。",
  feedbackCategoryLabel: "カテゴリ",
  feedbackSubmitBtn: "送信する",
  feedbackSubmittingBtn: "送信中…",
  feedbackTitleDescRequired: "タイトルと詳細は必須です。",
  feedbackLoginRequired: "フィードバックを投稿するにはログインが必要です。",
  feedbackRemoveVote: "投票を取り消す",
  feedbackUpvoteBtn: "賛成する",
  feedbackCatFeatureRequest: "機能リクエスト",
  feedbackCatImprovement: "改善",
  feedbackCatBug: "バグ",
  feedbackCatIntegration: "連携",
  feedbackCatPricing: "料金",
  feedbackCatOther: "その他",
  feedbackStatusUnderReview: "レビュー中",
  feedbackStatusPlanned: "予定",
  feedbackStatusInProgress: "進行中",
  feedbackStatusReleased: "リリース済",
  feedbackStatusNotPlanned: "未予定",
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
    "To run discussions in Adjudo, you need API keys from the AI services you want to use. An API key is like a personal access pass — it lets Adjudo call that AI on your behalf.",
  apiKeyMissingRunTitle: "API key required",
  apiKeyMissingRunDesc: 'An API key is needed to use this AI. Click "Get API key" to get one from the official page.',
  goToSettings: "Set up in Settings",
  // API key setup — friendly, step-by-step
  apiKeySetupTitle: "Set up your API keys",
  apiKeySetupLead:
    "To run discussions in Adjudo, you need API keys from the AI services you want to use. An API key is like a personal access pass that lets Adjudo call that AI on your behalf. Once set, Adjudo will use it to run discussions automatically.",
  apiKeySetupSupportText:
    'Click "Get API key" to open the provider\'s official page, create a key there, then come back and paste it into Adjudo.',
  apiKeySetupStep1: "Choose the AI service you want to use",
  apiKeySetupStep2: 'Click "Get API key" to open the official page',
  apiKeySetupStep3: "Create and copy your API key there",
  apiKeySetupStep4: "Come back to Adjudo and paste it here",
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
  landingSubcopy: "Adjudo helps solo founders and builders compare options, challenge assumptions, decide what to do next, and turn the result into execution-ready briefs and task lists.",
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
  landingByokItem4: "Adjudo charges a flat monthly subscription only",
  landingFooterCta: "Start using Adjudo for free",
  landingNav: "About Adjudo",
  // Landing page v2 — new sections (EN)
  landingEyebrow: "AI Decision Room",
  landingHeroLine1: "Turn messy thinking",
  landingHeroLine2: "into clear decisions.",
  landingSubcopyV2: "Built for solo founders and product-minded builders. Compare options, pressure-test assumptions, decide what to do now — and hand off a structured memo to your execution tools.",
  landingProblemEyebrow: "The problem",
  landingProblemTitle: "AI can help you think.\nThat doesn't mean you've decided.",
  landingProblemItem1Title: "The one-AI blind spot",
  landingProblemItem1Body: "Using one AI creates a narrow loop — you generate ideas, but without real pressure-testing or comparison, the decision quality stays low.",
  landingProblemItem2Title: "Exploration without landing",
  landingProblemItem2Body: "You explore options, map trade-offs, and still can't answer: what are we actually doing? The discussion ends without a clear verdict.",
  landingProblemItem3Title: "Handoff stays vague",
  landingProblemItem3Body: "When it's time to build, you can't tell ChatGPT or Replit what was decided — because the decision was never structured.",
  landingHowV2Title: "Compare. Challenge. Decide. Hand off.",
  landingHowV2Step1Title: "Compare",
  landingHowV2Step1Body: "Builder maps multiple options — pros, cons, and fit conditions — so you can see the real trade-offs side by side.",
  landingHowV2Step2Title: "Challenge",
  landingHowV2Step2Body: "Breaker stress-tests every assumption — surfacing shaky conditions, hidden dependencies, and failure scenarios.",
  landingHowV2Step3Title: "Decide",
  landingHowV2Step3Body: "Operator structures the outcome. Every item is classified: Do now / Not now / Consider later / Need more info.",
  landingHowV2Step4Title: "Hand off",
  landingHowV2Step4Body: "Get a one-page Decision Memo, a task list, and handoff-ready prompts to paste into your build tools.",
  landingMemoEyebrow: "Output",
  landingMemoTitle: "Every decision becomes a memo.",
  landingMemoSub: "Structured output ready to hand to ChatGPT, Claude, Manus, Replit, or Cursor.",
  landingPositioningTitle: "The layer between thinking and execution.",
  landingPositioningSub: "Adjudo isn't another chatbot, a PM tool, or a meeting summarizer. It's the decision layer that sits before you build.",
  landingUseCasesTitle: "Built for the decisions that move products forward.",
  landingUseCasesSub: "MVP scope, feature priority, pricing, LP messaging, implementation direction, build vs. buy — any decision that needs structure.",
  landingFooterCtaV2: "Create your first Decision Room.",
  landingFooterSub: "Free to start. No API keys required.",
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
  // Handoff panel
  handoffDecisionBrief:       "Decision Brief",
  handoffTaskList:             "Task List",
  handoffFutureConsiderations: "Future Considerations",
  handoffTaskCount:   (n) => `${n} task${n === 1 ? "" : "s"}`,
  handoffFutureCount: (n) => `${n} item${n === 1 ? "" : "s"}`,
  handoffCopyBrief:  "Copy Decision Brief",
  handoffCopyTasks:  "Copy Task List",
  handoffCopyAll:    "Copy All",
  handoffCopyGenericAI: "Copy Generic AI Prompt",
  handoffCopyBuild:     "Copy Build Prompt",
  handoffCopied:     "Copied",
  handoffNoFuture:   "No future considerations at this time",
  handoffNoTasks:    "No tasks found",
  // Invite code
  inviteCodeTitle:          "Invite Code",
  inviteCodeDesc:           "Enter your invite code to unlock Tester or Early Access access.",
  inviteCodePlaceholder:    "Enter code",
  inviteCodeApply:          "Apply",
  inviteCodeApplied:        "Invite code applied",
  inviteCodeSuccess:        "Invite code applied successfully!",
  inviteCodeInvalid:        "Invalid invite code. Please check the code and try again.",
  inviteCodeAlreadyApplied: "An invite code has already been applied to this account.",
  inviteCodeNetworkError:   "Connection error. Please try again.",
  inviteCodeNote:           "Invite codes grant Tester or Early Access status. Each code can be applied once per account.",
  // Usage limits
  usageTodayRemaining: (used, limit) => `Today: ${limit - used} / ${limit} remaining`,
  usageMonthly:        (used, limit) => `Monthly fair use: ${used} / ${limit} used`,
  usageUnlimited:      "Unlimited access",
  usageFairUse:        "Monthly fair use: 100 runs",
  usageLimitDayReached:     "You've reached today's Free usage limit. Please try again tomorrow.",
  usageLimitMonthReached:   "You've reached this month's Free usage limit.",
  usageContinuationLimit:   "Free plan allows one continuation per discussion.",
  // Room status
  roomStatusInReview:       "In Review",
  roomStatusCompleted:      "Completed",
  roomStatusArchived:       "Archived",
  flagFutureConsideration:  "Future Consideration",
  flagTasks:                "Tasks",
  flagHandoff:              "Handoff",
  // Decision type
  decisionTypeLabel:        "Decision Type",
  decisionTypeMvpScope:     "MVP Scope",
  decisionTypeFeaturePriority: "Feature Priority",
  decisionTypeLpCopy:       "LP Copy",
  decisionTypeImplementation: "Implementation",
  decisionTypePricing:      "Pricing Plan",
  decisionTypeOther:        "Other",
  decisionTypeSelectPlaceholder: "Select decision type",
  // Project layer
  projectLabel:             "Project",
  projectNew:               "New Project",
  projectNamePlaceholder:   "e.g. SaaS Product v1",
  projectNoProject:         "No project",
  projectSelect:            "Select project",
  projectCreate:            "Create project",
  projectArchive:           "Archive",
  projectArchivedLabel:     "Archived",
  projectDeleteConfirm:     "Delete this project?",
  // Decision Memo card
  decisionMemoTitle:        "Decision Memo",
  decisionMemoDecision:     "Decision",
  decisionMemoBackground:   "Background",
  decisionMemoReasoning:    "Reasoning",
  decisionMemoAxes:         "Axis Evaluations",
  decisionMemoConditions:   "Conditions That Change the Decision",
  decisionMemoDoNow:        "Do Now",
  decisionMemoNotNow:       "Not Now",
  decisionMemoFuture:       "Future Consideration",
  decisionMemoNeedsConfirmation: "Needs Confirmation",
  decisionMemoNextActions:  "Next Actions",
  decisionMemoReferencedMemos: "Referenced Past Decisions",
  decisionMemoCopy:         "Copy",
  decisionMemoCopied:       "Copied",
  decisionMemoAxisEval:     (axis: string) => axis,
  decisionMemoPriority:     (p: string) => p === "high" ? "High" : p === "medium" ? "Medium" : "Low",
  decisionMemoHumanReview:  "Needs human review",
  // Handoff copy 4 types
  handoffCopyDecisionMemo:  "Copy Decision Memo",
  handoffCopyTaskList2:     "Copy Task List",
  handoffCopyGenericAI2:    "Copy Generic AI Prompt",
  handoffCopyBuildPrompt:   "Copy Build Prompt",
  // Generation status
  generationStatusBuilder:  "Builder proposing…",
  generationStatusBreaker:  "Breaker reviewing…",
  generationStatusOperator: "Operator structuring…",
  generationStatusConclusion: "Generating conclusion…",
  // Settings sections
  settingsSectionAccount:   "Account",
  settingsSectionDisplay:   "Display",
  settingsSectionInvite:    "Invite Code",
  settingsSectionPlan:      "Plan",
  settingsDensityLabel:     "Display density",
  settingsDensityCompact:   "Compact",
  settingsDensityComfortable: "Comfortable",
  // Empty state with decision type
  emptyStateWithType:       (type: string) => `Start a ${type} decision`,
  // Room creation modal
  roomModeTitle:            "How do you want to start?",
  roomModeConsult:          "Light brainstorm",
  roomModeConsultDesc:      "Organize a fuzzy topic through back-and-forth conversation.",
  roomModeDecide:           "Make a decision",
  roomModeDecideDesc:       "Compare options, surface objections, and produce a Decision Memo.",
  tabTitleGenerating:       "Generating",
  tabTitleDone:             "Done",
  useProjectContextLabel:   "Reference past Decision Memos in this project",
  useProjectContextDesc:    "Up to 5 past decisions from the same project will be added to the AI's context.",
  newRoomDecisionTypeLabel: "What are you deciding? (optional)",
  // ── Feedback page ──────────────────────────────────────────────────────────
  feedbackPageTitle: "Help shape Adjudo",
  feedbackPageSub: "Vote on what we should build next, or suggest what would make Adjudo more useful for solo founders.",
  feedbackSuggestBtn: "Suggest",
  feedbackAllStatuses: "All statuses",
  feedbackMostVoted: "Most voted",
  feedbackNewest: "Newest",
  feedbackPinnedSection: "Pinned — help us decide",
  feedbackCommunitySection: "Community Requests",
  feedbackEmpty: "No feedback yet. Be the first!",
  feedbackLoadError: "Could not load feedback. Please try again.",
  feedbackVotesNeededLabel: "Votes needed to prioritize",
  feedbackNotePrefix: "Note: ",
  feedbackPinnedBadge: "Pinned",
  feedbackCostSensitive: "Cost-sensitive",
  feedbackWaitlistNudge: "Want to be first when Adjudo launches?",
  feedbackJoinWaitlistLink: "Join the waitlist →",
  feedbackBackToRooms: "← Rooms",
  feedbackLoginLink: "Log in",
  feedbackJoinWaitlistBtn: "Join waitlist",
  feedbackVoteModalTitle: "Enter your email to vote",
  feedbackVoteModalBody: "Your email is only used to prevent duplicate votes. It won't be shared publicly.",
  feedbackVoteEmailPlaceholder: "your@email.com",
  feedbackCancelBtn: "Cancel",
  feedbackVoteSubmitBtn: "Vote",
  feedbackVotingBtn: "Voting…",
  feedbackEmailRequired: "Email is required.",
  feedbackVoteError: "Something went wrong.",
  feedbackSubmitModalTitle: "Suggest a feature for Adjudo",
  feedbackTitleLabel: "Title",
  feedbackTitlePlaceholder: "e.g. Add Notion integration",
  feedbackDescLabel: "Description",
  feedbackDescPlaceholder: "Describe the problem this would solve or the improvement you'd like to see.",
  feedbackCategoryLabel: "Category",
  feedbackSubmitBtn: "Submit",
  feedbackSubmittingBtn: "Submitting…",
  feedbackTitleDescRequired: "Title and description are required.",
  feedbackLoginRequired: "You must be logged in to submit feedback.",
  feedbackRemoveVote: "Remove vote",
  feedbackUpvoteBtn: "Upvote",
  feedbackCatFeatureRequest: "Feature Request",
  feedbackCatImprovement: "Improvement",
  feedbackCatBug: "Bug",
  feedbackCatIntegration: "Integration",
  feedbackCatPricing: "Pricing",
  feedbackCatOther: "Other",
  feedbackStatusUnderReview: "Under Review",
  feedbackStatusPlanned: "Planned",
  feedbackStatusInProgress: "In Progress",
  feedbackStatusReleased: "Released",
  feedbackStatusNotPlanned: "Not Planned",
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
    if (stored === "en" || stored === "ja") return stored;
    const lang = (navigator.language ?? "").toLowerCase();
    return lang.startsWith("ja") ? "ja" : "en";
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
