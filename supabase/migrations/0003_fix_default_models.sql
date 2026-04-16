-- Fix default Anthropic model (claude-opus-4-5 does not exist)
-- Applies to: existing databases where 0001 was already run with wrong default

-- Update the column default for future rows
ALTER TABLE public.room_settings
  ALTER COLUMN side_b_model SET DEFAULT 'claude-sonnet-4-6';

-- Update any existing rows that still have the wrong model ID
UPDATE public.room_settings
  SET side_b_model = 'claude-sonnet-4-6'
  WHERE side_b_model = 'claude-opus-4-5';

UPDATE public.room_settings
  SET side_b_model = 'claude-sonnet-4-6'
  WHERE side_b_model = 'claude-sonnet-4-5';
