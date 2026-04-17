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
  landingModesTitle: string;
  landingByokTitle: string;
  landingByokLead: string;
  landingByokItem1: string;
  landingByokItem2: string;
  landingByokItem3: string;
  landingByokItem4: string;
  landingFooterCta: string;
  landingNav: string;
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
  settingsDesc: "変更は自動的に保存されます。",
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
  sideLabel: (s) => `サイド ${s}`,
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
  roleLabel: (side, mode) => {
    if (mode === "structured-debate") {
      return side === "A" ? "提案" : side === "B" ? "検証" : "実行";
    }
    return `Side ${side}`;
  },
  roleSubLabel: (side) => `Side ${side}`,
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
  previewRole1: "提案",
  previewRole2: "検証",
  previewRole3: "実行",
  previewMsg1: "機能数よりも先に、開発リソースの制約を見直すべきです。スコープを絞ってリリースし、四半期ごとに再評価する方が確実です。",
  previewMsg2: "それだけでは不十分です。問題はリソースだけでなく、成功指標が不明確なことです。最重要指標をひとつ決めることが先決では？",
  previewMsg3: "中間案として、北極星指標をひとつ決めることで、優先順位とスコープの両方を自動的に整理できます。",
  previewConclusionText: "まず最重要指標をひとつ決めることが、優先順位と開発負荷の両方を整理する近道です。",
  // Landing page
  landingHero: "ひとりのAIではなく、\n考えてくれるAIチームを。",
  landingSubcopy: "Qrooma は、複数のAIがそれぞれの視点で議論し、壁打ちで終わらず、ひとつの結論まで導く AI チームルームです。",
  landingGetStarted: "はじめる",
  landingGoToApp: "アプリを開く",
  landingCard1Title: "優秀な回答をひとつもらうだけでは足りない人へ",
  landingCard1Body: "ひとつの答えではなく、複数の視点から考えたい。",
  landingCard2Title: "複数のAIを自分で使い分けるのが面倒な人へ",
  landingCard2Body: "いくつものAIを行き来せず、ひとつの場所で議論を進めたい。",
  landingCard3Title: "浅い壁打ちではなく、深く考えたい人へ",
  landingCard3Body: "思いつきの返答ではなく、論点整理、反論、実行案まで踏み込みたい。",
  landingHowTitle: "使い方",
  landingHowStep1: "API キーを設定",
  landingHowStep1Label: "OpenAI・Anthropic・Google のキーを入力",
  landingHowStep2: "ルームを作成",
  landingHowStep2Label: "議題ごとにルームを分けて管理",
  landingHowStep3: "テーマを投げる",
  landingHowStep3Label: "AIチームが議論し、結論を生成",
  landingModesTitle: "2つのモード",
  landingByokTitle: "Bring Your Own Key",
  landingByokLead: "Qrooma は BYOK 方式です。",
  landingByokItem1: "利用には OpenAI・Anthropic・Google の APIキー設定が必要です",
  landingByokItem2: "APIキーはサーバーサイドで暗号化保存されます（本実装）",
  landingByokItem3: "利用料金はユーザー自身の契約ベースで発生します",
  landingByokItem4: "Qrooma への課金は月額プランのみ",
  landingFooterCta: "今すぐ Qrooma をはじめる",
  landingNav: "Qrooma について",
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
  settingsDesc: "Changes are saved automatically.",
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
  sideLabel: (s) => `Side ${s}`,
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
  roleLabel: (side, mode) => {
    if (mode === "structured-debate") {
      return side === "A" ? "Proposal" : side === "B" ? "Review" : "Execution";
    }
    return `Side ${side}`;
  },
  roleSubLabel: (side) => `Side ${side}`,
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
  previewRole1: "Proposal",
  previewRole2: "Review",
  previewRole3: "Execution",
  previewMsg1: "The real bottleneck isn't the feature list — it's engineering bandwidth. I'd ship a tighter scope and revisit quarterly.",
  previewMsg2: "I'd push back. The issue isn't just bandwidth — it's unclear success criteria. What's the one metric that matters most?",
  previewMsg3: "A middle path: lock one north star metric, then let it drive scope decisions automatically. Both problems solved.",
  previewConclusionText: "Align on one north star metric first — it resolves both the prioritization and bandwidth problems simultaneously.",
  // Landing page
  landingHero: "Not one AI.\nAn AI team that thinks together.",
  landingSubcopy: "Qrooma is an async AI team room where multiple AIs debate from their own perspectives — guiding you all the way to a conclusion, not just a quick reply.",
  landingGetStarted: "Get started",
  landingGoToApp: "Open app",
  landingCard1Title: "For those who need more than one great answer",
  landingCard1Body: "You want multiple perspectives, not just the first plausible response.",
  landingCard2Title: "For those tired of switching between AI tools",
  landingCard2Body: "Run the whole discussion in one place, without juggling tabs.",
  landingCard3Title: "For those who want depth, not just a sounding board",
  landingCard3Body: "Not a quick reply — structured arguments, counterpoints, and action items.",
  landingHowTitle: "How it works",
  landingHowStep1: "Set your API keys",
  landingHowStep1Label: "Enter keys for OpenAI, Anthropic, or Google",
  landingHowStep2: "Create a room",
  landingHowStep2Label: "Organize discussions by topic",
  landingHowStep3: "Post a topic",
  landingHowStep3Label: "The AI team debates and delivers a conclusion",
  landingModesTitle: "Two modes",
  landingByokTitle: "Bring Your Own Key",
  landingByokLead: "Qrooma is BYOK — you bring the keys.",
  landingByokItem1: "Requires API keys from OpenAI, Anthropic, and/or Google",
  landingByokItem2: "Keys are encrypted server-side in production — never exposed to the client",
  landingByokItem3: "API usage is billed directly through your own provider accounts",
  landingByokItem4: "Qrooma charges a flat monthly subscription only",
  landingFooterCta: "Start using Qrooma today",
  landingNav: "About Qrooma",
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
