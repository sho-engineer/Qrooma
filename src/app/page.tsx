import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold tracking-tight">Qrooma</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              今すぐ始める
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
          AI チームルーム
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6 text-gray-900">
          ひとりのAIではなく、<br className="hidden sm:block" />
          <span className="text-blue-600">考えてくれるAIチーム</span>を。
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          Qrooma は、複数のAIがそれぞれの視点で議論し、<br className="hidden sm:block" />
          壁打ちで終わらず、ひとつの結論まで導く AI チームルームです。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="w-full sm:w-auto bg-blue-600 text-white text-sm font-medium px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            今すぐ始める（無料）
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-sm text-gray-500 px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            ログイン
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          ※ 利用には各AIプロバイダーのAPIキーが必要です（BYOK方式）
        </p>
      </section>

      {/* ── 3 Value Props ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center sm:text-left">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                優秀な回答をひとつもらうだけでは足りない人へ
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                ひとつの答えではなく、複数の視点から考えたい。
                AIチームが異なる角度から議論し、多面的な分析を届けます。
              </p>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 3M21 7.5H7.5" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                複数のAIを自分で使い分けるのが面倒な人へ
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                初回のAPIキー設定後は、いくつものAIを行き来する必要はありません。
                Qrooma が一つの場所で議論を進めます。
              </p>
            </div>

            <div className="text-center sm:text-left">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4 mx-auto sm:mx-0">
                <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                浅い壁打ちではなく、深く考えたい人へ
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                思いつきの返答ではなく、論点整理・反論・リスク・実行案まで踏み込みます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">どう動く？</h2>
        <p className="text-sm text-gray-500 text-center mb-12">2つのモードから選べます</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* Structured Debate */}
          <div className="border border-violet-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                Structured Debate
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">構造化ディベート</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>各AIが初期意見を表明</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>互いの立場を批評・反論</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>批評を踏まえて意見を改訂</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-violet-700 text-white rounded-full flex items-center justify-center text-xs font-bold">J</span>
                <span>議論を総括し、結論・根拠・リスク・次のアクションを整理</span>
              </li>
            </ol>
            <p className="text-xs text-gray-400 mt-4">
              論点を深掘りしたいときに。
            </p>
          </div>

          {/* Free Talk */}
          <div className="border border-teal-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-0.5 rounded">
                Free Talk
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-3">フリートーク</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              各AIが会話の流れを読みながら、自由に意見を交わします。
              合意の兆しがあれば早期に収束し、最大3ラウンドで議論を終えます。
            </p>
            <p className="text-sm text-gray-600">
              議論後は、同じく結論カードにまとめられます。
            </p>
            <p className="text-xs text-gray-400 mt-4">
              アイデアを自由に広げたいときに。
            </p>
          </div>
        </div>

        {/* Conclusion Card */}
        <div className="border border-purple-200 bg-purple-50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              Conclusion
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-3">すべての議論は「結論カード」で終わる</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: '結論', color: 'text-gray-700' },
              { label: '根拠', color: 'text-gray-700' },
              { label: 'リスク', color: 'text-red-600' },
              { label: '次のアクション', color: 'text-green-700' },
              { label: '対立点', color: 'text-orange-600' },
              { label: '未解決事項', color: 'text-gray-500' },
            ].map(({ label, color }) => (
              <div key={label} className="bg-white rounded-lg px-3 py-2 border border-purple-100">
                <span className={`text-xs font-medium ${color}`}>{label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            ※ 結論はAIによる生成です。重要な意思決定には、ご自身の判断を加えてください。
          </p>
        </div>
      </section>

      {/* ── BYOK section ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">BYOK方式について</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Qrooma は「Bring Your Own Key（BYOK）」方式を採用しています。<br />
              利用するAIプロバイダー（OpenAI・Anthropic・Google）の APIキーをご自身でご用意ください。
              利用料金は各プロバイダーの契約に基づき、あなた自身のAPIキー経由で発生します。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">設定</p>
                <p className="text-sm text-gray-700">初回のみ各プロバイダーのダッシュボードでAPIキーを取得し、Settings に貼り付けるだけ</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">セキュリティ</p>
                <p className="text-sm text-gray-700">APIキーは AES-256-GCM で暗号化してサーバーに保存。クライアントには返しません</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">コスト</p>
                <p className="text-sm text-gray-700">Qrooma 自体の利用料は無料。各AIプロバイダーの API 使用料は別途発生します</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">AIチームと議論を始めよう</h2>
        <p className="text-gray-500 text-sm mb-8">
          OpenAI・Anthropic・Google、いずれかの APIキーがあればすぐに使えます。
        </p>
        <Link
          href="/signup"
          className="inline-block bg-blue-600 text-white text-sm font-medium px-10 py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          今すぐ始める（無料）
        </Link>
        <p className="text-xs text-gray-400 mt-4">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            ログイン
          </Link>
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-gray-400">
          <span>© 2025 Qrooma</span>
          <span>AI チームルーム</span>
        </div>
      </footer>
    </div>
  )
}
