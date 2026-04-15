'use client'

import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { updateUserDefaults } from '@/actions/userDefaults'
import type { UserDefaults } from '@/actions/userDefaults'
import type { Mode } from '@/types/database'

interface Props {
  defaults: UserDefaults
}

export function SettingsActions({ defaults }: Props) {
  async function handleModeSave(mode: Mode) {
    return updateUserDefaults({ mode })
  }

  async function handleModelSave(updates: Partial<UserDefaults>) {
    return updateUserDefaults(updates)
  }

  return (
    <>
      <section>
        <DefaultModeSelector initialMode={defaults.mode} onSave={handleModeSave} />
      </section>

      <section>
        <ModelSelector
          roomId="defaults"
          initial={{
            side_a: { provider: defaults.side_a_provider, model: defaults.side_a_model },
            side_b: { provider: defaults.side_b_provider, model: defaults.side_b_model },
            side_c: { provider: defaults.side_c_provider, model: defaults.side_c_model },
          }}
          onSave={handleModelSave}
        />
      </section>
    </>
  )
}
