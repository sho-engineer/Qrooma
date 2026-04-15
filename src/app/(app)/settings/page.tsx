import { getSavedProviders } from '@/actions/apiKeys'
import { ApiKeyForm } from '@/components/settings/ApiKeyForm'

export default async function SettingsPage() {
  const savedProviders = await getSavedProviders()

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your AI provider API keys. Keys are encrypted and stored securely server-side.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            API Keys (BYOK)
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Your API keys are encrypted (AES-256) before storage. They are never sent to the client
            and are decrypted server-side only when running AI tasks.
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
        </div>
      </section>
    </div>
  )
}
