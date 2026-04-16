import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

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
  apiKeys: "API キー",
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
  emptyStateDesc: "下の入力欄にトピックや質問を入力してください。ChatGPT・Claude・Gemini がそれぞれの視点で回答します。",
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
  apiKeys: "API Keys",
  apiKeysTempWarningTitle: "Temporary storage",
  apiKeysTempWarningDesc:
    "API keys are currently stored in your browser's localStorage. This is a placeholder implementation. The final spec uses encrypted server-side storage per account — keys will never be exposed to the client.",
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
  emptyStateDesc: "Post a topic or question below. ChatGPT, Claude, and Gemini will each share their perspective — then you can dig deeper.",
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
