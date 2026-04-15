import { getSavedProviders } from '@/actions/apiKeys'
import { ApiKeyForm } from '@/components/settings/ApiKeyForm'
import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { getOrCreateUserDefaults } from '@/actions/userDefaults'
import { SettingsActions } from './SettingsActions'

export default async function SettingsPage() {
  const [savedProviders, defaults] = await Promise.all([
    getSavedProviders(),
    getOrCreateUserDefaults(),
  ])

  return (
    <div className="p-6 max-w-2xl overflow-y-auto h-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure API keys and default settings for new rooms.
        </p>
      </div>

      <div className="space-y-8">
        {/* API Keys */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            API Keys (BYOK)
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Keys are encrypted (AES-256-GCM) and stored server-side only. Never sent to the
            client.
          </p>
          <div className="space-y-3">
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

        {/* Default Mode + AI Sides — client components need callbacks via wrapper */}
        <SettingsActions defaults={defaults} />
      </div>
    </div>
  )
}
