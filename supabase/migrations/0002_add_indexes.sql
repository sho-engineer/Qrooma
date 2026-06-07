-- Additional indexes for common query patterns
-- runs: fetching all runs for a room sorted by time
create index if not exists runs_room_id_created_at_idx
  on public.runs(room_id, created_at desc);
