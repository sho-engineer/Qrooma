import { getSavedProviders } from '@/actions/apiKeys'
import { getLocale } from '@/actions/locale'
import { getT } from '@/lib/i18n'
import { ApiKeyForm } from '@/components/settings/ApiKeyForm'
import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { LocaleSelector } from '@/components/settings/LocaleSelector'
import { ApiKeyInfoCard } from '@/components/settings/ApiKeyInfoCard'
import { getOrCreateUserDefaults } from '@/actions/userDefaults'
import { SettingsActions } from './SettingsActions'

export default async function SettingsPage() {
  const [savedProviders, defaults, locale] = await Promise.all([
    getSavedProviders(),
    getOrCreateUserDefaults(),
    getLocale(),
  ])

  const t = getT(locale)

  return (
    <div className="p-6 max-w-2xl overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{t.settingsTitle}</h2>
        <p className="text-sm text-gray-500 mt-1">{t.settingsDesc}</p>
      </div>

      <div className="space-y-8">
        {/* UI Language */}
        <section className="border border-gray-200 rounded-lg p-4">
          <LocaleSelector current={locale} />
        </section>

        {/* API Keys */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            {t.apiKeys}
          </h3>
          <p className="text-xs text-gray-400 mb-4">{t.apiKeysDesc}</p>
          <ApiKeyInfoCard />
          <div className="space-y-3 mt-4">
            <ApiKeyForm
              provider="openai"
              label="OpenAI"
              placeholder="sk-..."
              saved={savedProviders.includes('openai')}
            />
            <ApiKeyForm
              provider="anthropic"
              label="Anthropic"
              placeholder="sk-ant-..."
              saved={savedProviders.includes('anthropic')}
            />
            <ApiKeyForm
              provider="google"
              label="Google (Gemini)"
              placeholder="AIza..."
              saved={savedProviders.includes('google')}
            />
          </div>
        </section>

        {/* Default Mode + AI Sides */}
        <SettingsActions defaults={defaults} />
      </div>
    </div>
  )
}
