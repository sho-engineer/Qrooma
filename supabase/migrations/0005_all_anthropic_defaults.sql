-- Set all sides to Claude Opus 4.8 by default (single API key needed)
ALTER TABLE public.room_settings
  ALTER COLUMN side_a_provider SET DEFAULT 'anthropic',
  ALTER COLUMN side_a_model    SET DEFAULT 'claude-opus-4-8',
  ALTER COLUMN side_b_provider SET DEFAULT 'anthropic',
  ALTER COLUMN side_b_model    SET DEFAULT 'claude-opus-4-8',
  ALTER COLUMN side_c_provider SET DEFAULT 'anthropic',
  ALTER COLUMN side_c_model    SET DEFAULT 'claude-opus-4-8';

-- Update existing rooms that still use OpenAI/Google defaults
UPDATE public.room_settings
  SET
    side_a_provider = 'anthropic',
    side_a_model    = 'claude-opus-4-8',
    side_c_provider = 'anthropic',
    side_c_model    = 'claude-opus-4-8'
  WHERE
    side_a_provider = 'openai'
    AND side_c_provider = 'google';
