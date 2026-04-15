'use client'

import { DefaultModeSelector } from '@/components/settings/DefaultModeSelector'
import { ModelSelector } from '@/components/settings/ModelSelector'
import { updateRoomSettings } from '@/actions/rooms'
import type { Database, Mode } from '@/types/database'

type RoomSettings = Database['public']['Tables']['room_settings']['Row']

interface Props {
  roomId: string
  settings: RoomSettings
}

export function RoomSettingsForm({ roomId, settings }: Props) {
  async function handleModeSave(mode: Mode) {
    return updateRoomSettings(roomId, { mode })
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
        <ModelSelector
          roomId={roomId}
          initial={{
            side_a: { provider: settings.side_a_provider, model: settings.side_a_model },
            side_b: { provider: settings.side_b_provider, model: settings.side_b_model },
            side_c: { provider: settings.side_c_provider, model: settings.side_c_model },
          }}
          onSave={handleModelSave}
        />
      </section>

      {/* Auto-run toggle */}
      <section>
        <AutoRunToggle roomId={roomId} initial={settings.auto_run_on_user_message} />
      </section>
    </div>
  )
}

function AutoRunToggle({
  roomId,
  initial,
}: {
  roomId: string
  initial: boolean
}) {
  // Handled inline as simple controlled toggle
  return (
    <AutoRunToggleClient roomId={roomId} initial={initial} />
  )
}

// Extracted to avoid mixing client/server in same file
import { AutoRunToggleClient } from './AutoRunToggleClient'
