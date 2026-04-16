'use client'

import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { AgentCountSelector } from '@/components/settings/AgentCountSelector'
import { updateUserDefaults } from '@/actions/userDefaults'
import type { UserDefaults } from '@/actions/userDefaults'
import type { Mode } from '@/types/database'

interface Props {
  defaults: UserDefaults
}

export function SettingsActions({ defaults }: Props) {
  const activeAgentCount = (defaults.active_agent_count ?? 3) as 2 | 3

  async function handleModeSave(mode: Mode) {
    return updateUserDefaults({ mode })
  }

  async function handleAgentCountSave(count: 2 | 3) {
    return updateUserDefaults({ active_agent_count: count })
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
        <AgentCountSelector initial={activeAgentCount} onSave={handleAgentCountSave} />
      </section>

      <section>
        <ModelSelector
          roomId="defaults"
          initial={{
            side_a: { provider: defaults.side_a_provider, model: defaults.side_a_model },
            side_b: { provider: defaults.side_b_provider, model: defaults.side_b_model },
            side_c: { provider: defaults.side_c_provider, model: defaults.side_c_model },
          }}
          activeAgentCount={activeAgentCount}
          onSave={handleModelSave}
        />
      </section>
    </>
  )
}
