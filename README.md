# Qrooma

BYOK前提の非同期AIチーム室 — グループチャット風UIで3つのAI（OpenAI / Anthropic / Google）が議論し、結論カードを生成するWebアプリです。

## MVP でできること

| 機能 | 状態 |
|---|---|
| メール/パスワード認証（signup / login / logout） | ✅ |
| 複数ルーム作成・リネーム・削除 | ✅ |
| ユーザーメッセージ投稿 | ✅ |
| 3つのAI（OpenAI / Anthropic / Google）による非同期議論 | ✅ |
| Structured Debate モード | ✅ |
| Free Talk モード | ✅ |
| APIキーの暗号化保存（AES-256-GCM） | ✅ |
| 実行ステータスのリアルタイム表示（Supabase Realtime） | ✅ |
| 結論カードの表示（conclusion / rationale / risks / disagreements / unknowns / next_actions） | ✅ |
| 失敗時のリトライ | ✅ |
| 途中経過の保存（run_steps） | ✅ |

## MVP でできないこと

| 機能 | 備考 |
|---|---|
| 課金 | 未実装 |
| 通知 | 未実装 |
| ファイル添付 | 未実装 |
| Web検索 | 未実装 |
| 共有ルーム | 未実装 |
| ソーシャルログイン | 未実装 |
| ルーム内でのモデル設定変更UI | DBに保存済み・UIは未実装 |

---

## セットアップ手順

### 1. リポジトリをクローン

```bash
git clone <repo-url>
cd Qrooma
npm install
```

### 2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` を編集して以下を埋める：

| 変数 | 取得場所 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 同上（service_role key） |
| `ENCRYPTION_KEY` | 下記コマンドで生成 |
| `TRIGGER_SECRET_KEY` | cloud.trigger.dev → Project Settings |
| `TRIGGER_PROJECT_ID` | 同上 |

```bash
# ENCRYPTION_KEY の生成（64文字の16進数文字列）
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Supabase DBスキーマを適用

Supabase ダッシュボード → SQL Editor で以下を実行：

```
supabase/migrations/0001_initial_schema.sql
```

または Supabase CLI を使う場合：

```bash
npx supabase db push
```

### 4. Trigger.dev を設定

1. [cloud.trigger.dev](https://cloud.trigger.dev) でプロジェクト作成
2. `trigger.config.ts` の `project` にプロジェクトIDを設定（または `TRIGGER_PROJECT_ID` 環境変数）
3. `TRIGGER_SECRET_KEY` を `.env.local` に設定
4. **重要**: Trigger.dev ダッシュボードの環境変数に以下を追加（Vercel/ローカルから自動継承されないため必須）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_KEY`

### 5. ローカル起動

```bash
# Terminal 1: Next.js 開発サーバー
npm run dev

# Terminal 2: Trigger.dev ローカルワーカー（ローカルトンネル）
npx trigger.dev@latest dev
```

アプリが `http://localhost:3000` で起動します。

---

## データモデル

```
users              → Supabase Auth が管理
encrypted_api_keys → provider ごとに AES-256-GCM 暗号化して保存
rooms              → ユーザーごとの部屋
room_settings      → モード・モデル設定（structured_debate / free_talk）
messages           → ユーザー発言・AI発言（side: a/b/c/judge）
runs               → 1回の AI 実行（queued → running → done/failed）
run_steps          → 各 AI の発言ステップ（initial_opinion / critique / revision / turn / judge）
```

## 実行フロー

### Structured Debate
1. ユーザーメッセージ → run 作成（queued）
2. Trigger.dev ジョブ起動
3. 各AI（A/B/C）が独立して初回意見を出す（並列）
4. 各AIが他の意見を批判する（並列）
5. 各AIが修正版を出す（並列）
6. Judge（Side A のモデル）が統合
7. conclusion card を runs.conclusion に保存 → status: done

### Free Talk
1. ユーザーメッセージ → run 作成（queued）
2. Trigger.dev ジョブ起動
3. AI が順番に発言（A → B → C → A → ...、最大3ラウンド）
4. 収束条件（全員が合意キーワードを含む）で早期終了
5. Judge が統合 → conclusion card 保存

## セキュリティ

- APIキーはクライアントに絶対返さない（`encrypted_key` カラムはServer Action/Route Handleから返さない）
- `SUPABASE_SERVICE_ROLE_KEY` はサーバー専用（`NEXT_PUBLIC_` プレフィックスなし）
- `ENCRYPTION_KEY` は Trigger.dev ダッシュボードで別途設定必須
- RLS（Row Level Security）で全テーブルを user_id で分離
- Trigger.dev タスク内でのみAPIキーを復号（ペイロードに生キーを含めない）

## 技術スタック

- **Next.js 14** (App Router, TypeScript, Server Actions)
- **Supabase** (Auth + Postgres + Realtime)
- **Trigger.dev v3** (非同期AIジョブ実行)
- **Tailwind CSS**
- **Vercel** (デプロイ先)
