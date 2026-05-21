const USAGE_KEY        = "qrooma_usage_v1";
const CONT_KEY         = "qrooma_continuations_v1";

interface UsageData {
  daily:   Record<string, number>;
  monthly: Record<string, number>;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

function load(): UsageData {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { daily: {}, monthly: {} };
    return JSON.parse(raw) as UsageData;
  } catch {
    return { daily: {}, monthly: {} };
  }
}

function save(data: UsageData): void {
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

export const usageService = {
  getDailyCount(): number {
    return load().daily[todayKey()] ?? 0;
  },

  getMonthlyCount(): number {
    return load().monthly[monthKey()] ?? 0;
  },

  increment(): void {
    const data = load();
    const d = todayKey();
    const m = monthKey();
    data.daily[d]   = (data.daily[d]   ?? 0) + 1;
    data.monthly[m] = (data.monthly[m] ?? 0) + 1;
    save(data);
  },

  getContinuationCount(roomId: string): number {
    try {
      const raw = localStorage.getItem(CONT_KEY);
      if (!raw) return 0;
      const data = JSON.parse(raw) as Record<string, number>;
      return data[roomId] ?? 0;
    } catch {
      return 0;
    }
  },

  incrementContinuation(roomId: string): void {
    try {
      const raw  = localStorage.getItem(CONT_KEY);
      const data: Record<string, number> = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      data[roomId] = (data[roomId] ?? 0) + 1;
      localStorage.setItem(CONT_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
  },

  canRunToday(limit: number | null): boolean {
    if (limit === null) return true;
    return this.getDailyCount() < limit;
  },

  canRunThisMonth(limit: number | null): boolean {
    if (limit === null) return true;
    return this.getMonthlyCount() < limit;
  },

  canContinue(roomId: string, limit: number | null): boolean {
    if (limit === null) return true;
    return this.getContinuationCount(roomId) < limit;
  },
};
