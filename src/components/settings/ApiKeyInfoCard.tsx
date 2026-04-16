import { getLocale } from '@/actions/locale'
import { getT } from '@/lib/i18n'

export async function ApiKeyInfoCard() {
  const locale = await getLocale()
  const t = getT(locale)

  const items = [
    t.apiKeyInfoBYOK,
    t.apiKeyInfoRequired,
    t.apiKeyInfo3Providers,
    t.apiKeyInfoFailed,
    t.apiKeyInfoEncrypted,
  ]

  return (
    <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-blue-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
        <h4 className="text-sm font-semibold text-blue-700">{t.apiKeyInfoTitle}</h4>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
            <span className="text-xs text-blue-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
