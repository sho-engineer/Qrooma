'use client'

import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { AgentCountSelector } from '@/components/settings/AgentCountSelector'
import { AutoRunToggleClient } from './AutoRunToggleClient'
import { updateRoomSettings } from '@/actions/rooms'
import type { Database, Mode } from '@/types/database'

type RoomSettings = Database['public']['Tables']['room_settings']['Row']

interface Props {
  roomId: string
  settings: RoomSettings
}

export function RoomSettingsForm({ roomId, settings }: Props) {
  const activeAgentCount = (settings.active_agent_count ?? 3) as 2 | 3

  async function handleModeSave(mode: Mode) {
    return updateRoomSettings(roomId, { mode })
  }

  async function handleAgentCountSave(count: 2 | 3) {
    return updateRoomSettings(roomId, { active_agent_count: count })
  }

  async function handleModelSave(
    updates: Parameters<typeof updateRoomSettings>[1]
  ) {
    return updateRoomSettings(roomId, updates)
  }

  return (
    <div className="space-y-8">
      <section>
        <DefaultModeSelector initialMode={settings.mode} onSave={handleModeSave} />
      </section>

      <section>
        <AgentCountSelector initial={activeAgentCount} onSave={handleAgentCountSave} />
      </section>

      <section>
        <ModelSelector
          roomId={roomId}
          initial={{
            side_a: { provider: settings.side_a_provider, model: settings.side_a_model },
            side_b: { provider: settings.side_b_provider, model: settings.side_b_model },
            side_c: { provider: settings.side_c_provider, model: settings.side_c_model },
          }}
          activeAgentCount={activeAgentCount}
          onSave={handleModelSave}
        />
      </section>

      <section>
        <AutoRunToggleClient roomId={roomId} initial={settings.auto_run_on_user_message} />
      </section>
    </div>
  )
}
