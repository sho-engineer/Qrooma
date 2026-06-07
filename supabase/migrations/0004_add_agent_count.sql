-- Add active_agent_count to room_settings (2 or 3 sides active)
ALTER TABLE room_settings
  ADD COLUMN IF NOT EXISTS active_agent_count INT NOT NULL DEFAULT 3
    CHECK (active_agent_count IN (2, 3));
