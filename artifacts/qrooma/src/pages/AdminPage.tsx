import { useState, useEffect, useCallback, Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import { Redirect } from "wouter";
import {
  UsersIcon, TagIcon, MessageSquareIcon, BarChart2Icon,
  PlusIcon, ToggleLeftIcon, ToggleRightIcon, ShieldIcon, UserIcon,
  TrendingUpIcon, CalendarIcon, ArrowUpIcon, MapPinIcon, MailIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Metrics {
  totalUsers:         number;
  newUsersToday:      number;
  newUsersThisWeek:   number;
  newUsersThisMonth:  number;
  activeUsers7d:      number;
  activeUsers30d:     number;
  totalDecisionRooms: number;
  totalMemos:         number;
  totalFeedbackPosts: number;
  totalFeedbackVotes: number;
  totalCoupons:       number;
  totalRedemptions:   number;
  totalWaitlist:      number;
}

interface DBUser {
  id:                  string;
  email:               string;
  name:                string;
  role:                "user" | "tester" | "admin";
  status:              "active" | "waitlist" | "blocked" | "deleted";
  createdAt:           string;
  lastActiveAt:        string;
  fullAccessExpiresAt: string | null;
  blockedAt:           string | null;
  blockedReason:       string | null;
  deletedAt:           string | null;
  adminNote:           string | null;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: "percentage" | "fixed_amount" | "free_trial_days";
  discountValue: number;
  currency: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
  createdAt: string;
  accessDays: number;
  couponType: string;
  note: string | null;
}

interface FeedbackPost {
  id: string;
  title: string;
  status: string;
  category: string | null;
  upvoteCount: number;
  isPinned: boolean;
  isHidden: boolean;
  adminNote: string | null;
  createdAt: string;
}

interface AnalyticsRow {
  eventName: string;
  c: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function relDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)    return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function MetricCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────────────────

function OverviewTab({ headers }: { headers: Record<string, string> }) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/metrics", { headers }).then((r) => r.json()),
      fetch("/api/admin/analytics", { headers }).then((r) => r.json()),
    ]).then(([m, a]) => {
      setMetrics(m as Metrics);
      setAnalytics(a as AnalyticsRow[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionTitle icon={<UsersIcon size={13} />} label="Users" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard label="Total users"       value={metrics?.totalUsers ?? 0} />
          <MetricCard label="New today"         value={metrics?.newUsersToday ?? 0} />
          <MetricCard label="New this week"     value={metrics?.newUsersThisWeek ?? 0} />
          <MetricCard label="New this month"    value={metrics?.newUsersThisMonth ?? 0} />
          <MetricCard label="Active (7d)"       value={metrics?.activeUsers7d ?? 0} />
          <MetricCard label="Active (30d)"      value={metrics?.activeUsers30d ?? 0} />
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle icon={<TrendingUpIcon size={13} />} label="Activity" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard label="Decision Rooms"    value={metrics?.totalDecisionRooms ?? 0} />
          <MetricCard label="Decision Memos"    value={metrics?.totalMemos ?? 0} />
          <MetricCard label="Feedback Posts"    value={metrics?.totalFeedbackPosts ?? 0} />
          <MetricCard label="Feedback Votes"    value={metrics?.totalFeedbackVotes ?? 0} />
          <MetricCard label="Coupons"           value={metrics?.totalCoupons ?? 0} />
          <MetricCard label="Redemptions"       value={metrics?.totalRedemptions ?? 0} />
          <MetricCard label="Waitlist"          value={metrics?.totalWaitlist ?? 0} />
        </div>
      </section>

      {analytics.length > 0 && (
        <section className="space-y-3">
          <SectionTitle icon={<BarChart2Icon size={13} />} label="Event Breakdown" />
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {analytics.map((row, i) => (
              <div
                key={row.eventName}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${i < analytics.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="text-foreground font-mono text-[12px]">{row.eventName}</span>
                <span className="font-semibold text-foreground tabular-nums">{row.c}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Tab: Users ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  waitlist: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  blocked:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  deleted:  "bg-muted text-muted-foreground",
};
const ROLE_COLORS: Record<string, string> = {
  admin:  "bg-primary/10 text-primary",
  tester: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  user:   "bg-muted text-muted-foreground",
};

function UsersTab({ headers, currentUserId }: { headers: Record<string, string>; currentUserId: string }) {
  const [users, setUsers]       = useState<DBUser[]>([]);
  const [loading, setLoad]      = useState(true);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRF]     = useState("");
  const [statusFilter, setSF]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving]     = useState<string | null>(null);
  const [blockReason,  setBlockReason]  = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [extendDays,   setExtendDays]   = useState("7");
  const [noteInput,    setNoteInput]    = useState("");

  useEffect(() => {
    fetch("/api/admin/users", { headers })
      .then(r => r.json())
      .then(d => { setUsers(Array.isArray(d) ? d as DBUser[] : []); setLoad(false); });
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    if (q && !u.email.toLowerCase().includes(q) && !u.name.toLowerCase().includes(q)) return false;
    if (roleFilter   && u.role   !== roleFilter)   return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  function toggleExpand(id: string, u: DBUser) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    setBlockReason(u.blockedReason ?? "");
    setDeleteReason("");
    setExtendDays("7");
    setNoteInput(u.adminNote ?? "");
  }

  async function doAction(id: string, endpoint: string, body: object, method = "PATCH") {
    setSaving(id);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated = await res.json() as Partial<DBUser>;
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updated } : u));
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-3">
      {/* Search + count */}
      <div className="flex gap-2 items-center">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search email or name…"
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-border"
        />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {(["", "user", "tester", "admin"] as const).map(r => (
          <button key={r || "all-role"} onClick={() => setRF(r)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${roleFilter === r ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {r || "All roles"}
          </button>
        ))}
        <span className="text-muted-foreground text-[11px] mx-0.5">|</span>
        {(["", "active", "waitlist", "blocked", "deleted"] as const).map(s => (
          <button key={s || "all-status"} onClick={() => setSF(s)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${statusFilter === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {s || "All statuses"}
          </button>
        ))}
      </div>

      {/* User list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filtered.map((u, i) => {
          const isSelf = u.id === currentUserId;
          const isExp  = expanded === u.id;
          const isUnlimited = u.fullAccessExpiresAt && new Date(u.fullAccessExpiresAt) > new Date("2099-01-01");
          const accessExpired = u.fullAccessExpiresAt && !isUnlimited && new Date(u.fullAccessExpiresAt) <= new Date();
          return (
            <Fragment key={u.id}>
              {/* Row */}
              <div
                onClick={() => toggleExpand(u.id, u)}
                className={`px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors select-none
                  ${i > 0 ? "border-t border-border" : ""}
                  ${isExp ? "bg-muted/10" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground truncate">{u.email}</span>
                      {isSelf && <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">You</span>}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{u.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ROLE_COLORS[u.role] ?? ""}`}>{u.role}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_COLORS[u.status] ?? ""} ${u.status === "deleted" ? "line-through" : ""}`}>{u.status}</span>
                    <span className={`text-muted-foreground text-[10px] ml-1 inline-block transition-transform duration-200 ${isExp ? "-rotate-180" : ""}`}>▾</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span>Joined {relDate(u.createdAt)}</span>
                  <span>Active {relDate(u.lastActiveAt)}</span>
                  {isUnlimited && <span className="text-emerald-600 dark:text-emerald-400">Unlimited access</span>}
                  {!isUnlimited && u.fullAccessExpiresAt && (
                    <span className={accessExpired ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}>
                      {accessExpired ? "Access expired" : `Until ${new Date(u.fullAccessExpiresAt).toLocaleDateString()}`}
                    </span>
                  )}
                  {u.adminNote && <span title={u.adminNote} className="opacity-70">📝 note</span>}
                  {u.status === "blocked" && u.blockedReason && <span className="text-red-400">⚠ {u.blockedReason}</span>}
                </div>
              </div>

              {/* Expanded panel */}
              {isExp && (
                <div className={`border-t border-border bg-muted/5 ${isSelf ? "px-4 py-3" : "px-4 py-4 space-y-4"}`}>
                  {isSelf ? (
                    <p className="text-[12px] text-muted-foreground">自分のアカウントはここから変更できません。</p>
                  ) : (
                    <>
                      {/* ── Role ── */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Role</span>
                        <div className="flex gap-1">
                          {(["user", "tester", "admin"] as const).map(r => (
                            <button key={r} disabled={saving === u.id || u.role === r}
                              onClick={e => { e.stopPropagation(); void doAction(u.id, `/api/admin/users/${u.id}/role`, { role: r }); }}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-40
                                ${u.role === r ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"}`}>
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Status ── */}
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Status</span>
                        <div className="flex gap-1">
                          {(["active", "waitlist", "blocked", "deleted"] as const).map(s => (
                            <button key={s} disabled={saving === u.id || u.status === s}
                              onClick={e => { e.stopPropagation(); void doAction(u.id, `/api/admin/users/${u.id}/status`, { status: s }); }}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors disabled:opacity-40
                                ${u.status === s ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* ── Block / Unblock ── */}
                      {u.status !== "blocked" ? (
                        <div className="flex items-start gap-3">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20 pt-1.5">Block</span>
                          <div className="flex gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
                            <input type="text" value={blockReason} onChange={e => setBlockReason(e.target.value)}
                              placeholder="Reason (optional)"
                              className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background" />
                            <button disabled={saving === u.id}
                              onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/block`, { reason: blockReason }, "POST")}
                              className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 font-medium whitespace-nowrap">
                              Block
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Unblock</span>
                          <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                            <button disabled={saving === u.id}
                              onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/unblock`, {}, "POST")}
                              className="px-3 py-1 text-xs rounded border border-border text-foreground hover:bg-accent disabled:opacity-40">
                              Unblock
                            </button>
                            {u.blockedReason && <span className="text-[11px] text-muted-foreground italic">{u.blockedReason}</span>}
                          </div>
                        </div>
                      )}

                      {/* ── Soft-delete / Restore ── */}
                      {u.status !== "deleted" ? (
                        <div className="flex items-start gap-3">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20 pt-1.5">Delete</span>
                          <div className="flex gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
                            <input type="text" value={deleteReason} onChange={e => setDeleteReason(e.target.value)}
                              placeholder="Reason (optional)"
                              className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background" />
                            <button disabled={saving === u.id}
                              onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/soft-delete`, { reason: deleteReason }, "POST")}
                              className="px-3 py-1 text-xs rounded bg-foreground text-background hover:opacity-80 disabled:opacity-40 font-medium whitespace-nowrap">
                              Soft Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Restore</span>
                          <button disabled={saving === u.id} onClick={e => { e.stopPropagation(); void doAction(u.id, `/api/admin/users/${u.id}/restore`, {}, "POST"); }}
                            className="px-3 py-1 text-xs rounded border border-border text-foreground hover:bg-accent disabled:opacity-40">
                            Restore
                          </button>
                        </div>
                      )}

                      {/* ── Access ── */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">Access</span>
                        <div className="flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
                          {([3, 7, 14] as const).map(d => (
                            <button key={d} disabled={saving === u.id}
                              onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/access`, { action: "extend", days: d })}
                              className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-40">
                              +{d}d
                            </button>
                          ))}
                          <div className="flex gap-1">
                            <input type="number" value={extendDays} onChange={e => setExtendDays(e.target.value)}
                              min="1" max="365" className="w-14 px-2 py-1 text-xs rounded border border-border bg-background text-center" />
                            <button disabled={saving === u.id}
                              onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/access`, { action: "extend", days: Number(extendDays) })}
                              className="px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-40">
                              +d
                            </button>
                          </div>
                          <button disabled={saving === u.id}
                            onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/access`, { action: "unlimited" })}
                            className="px-2.5 py-1 rounded text-xs bg-foreground text-background hover:opacity-80 disabled:opacity-40 font-medium">
                            Unlimited
                          </button>
                          <button disabled={saving === u.id}
                            onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/access`, { action: "expire" })}
                            className="px-2.5 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-foreground disabled:opacity-40">
                            Expire
                          </button>
                        </div>
                      </div>

                      {/* ── Admin note ── */}
                      <div className="flex items-start gap-3">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20 pt-1.5">Note</span>
                        <div className="flex gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
                          <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} rows={2}
                            placeholder="Internal admin note…"
                            className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background resize-none" />
                          <button disabled={saving === u.id}
                            onClick={() => void doAction(u.id, `/api/admin/users/${u.id}/note`, { note: noteInput })}
                            className="px-3 py-1 text-xs rounded bg-foreground text-background hover:opacity-80 disabled:opacity-40 self-start">
                            Save
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
        {filtered.length === 0 && <EmptyRow label="No users match." />}
      </div>
    </div>
  );
}

// ── Tab: Coupons ───────────────────────────────────────────────────────────

type CouponTypeName = "questionnaire_3d" | "payment_commitment_7d" | "beta_14d" | "custom";
interface CouponPreset { days: number; maxRed: number; prefix: string; label: string }
const COUPON_PRESETS: Record<CouponTypeName, CouponPreset> = {
  questionnaire_3d:      { days: 3,  maxRed: 1, prefix: "ADJUDO-3D",  label: "Questionnaire (3d)" },
  payment_commitment_7d: { days: 7,  maxRed: 1, prefix: "ADJUDO-7D",  label: "Payment (7d)" },
  beta_14d:              { days: 14, maxRed: 1, prefix: "ADJUDO-14D", label: "Beta (14d)" },
  custom:                { days: 14, maxRed: 1, prefix: "ADJUDO",     label: "Custom" },
};

function genSuffix() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

interface LookupRedemption {
  id: string; userId: string; userEmail: string | null;
  redeemedAt: string; accessDaysGranted: number | null; newAccessExpiresAt: string | null;
}
interface LookupResult {
  found: boolean;
  coupon?: Coupon;
  redemptions?: LookupRedemption[];
}

function CouponsTab({ headers }: { headers: Record<string, string> }) {
  const [coupons,    setCoupons]   = useState<Coupon[]>([]);
  const [loading,    setLoad]      = useState(true);
  const [showForm,   setForm]      = useState(false);
  const [saving,     setSaving]    = useState(false);
  const [formError,  setFormError] = useState("");

  // Form state
  const [couponType, setCouponType] = useState<CouponTypeName>("beta_14d");
  const [code,       setCode]       = useState(() => `ADJUDO-14D-${genSuffix()}`);
  const [name,       setName]       = useState("");
  const [maxRed,     setMaxRed]     = useState("1");
  const [accessDays, setAccessDays] = useState("14");
  const [expires,    setExpires]    = useState("");
  const [note,       setNote]       = useState("");

  // Lookup state
  const [lookupCode,    setLookupCode]    = useState("");
  const [lookupResult,  setLookupResult]  = useState<LookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  function applyPreset(t: CouponTypeName) {
    const p = COUPON_PRESETS[t];
    setCouponType(t);
    setCode(`${p.prefix}-${genSuffix()}`);
    setAccessDays(String(p.days));
    setMaxRed(String(p.maxRed));
  }

  function resetForm() {
    setCouponType("beta_14d");
    setCode(`ADJUDO-14D-${genSuffix()}`);
    setName(""); setMaxRed("1"); setAccessDays("14");
    setExpires(""); setNote(""); setFormError("");
  }

  useEffect(() => {
    fetch("/api/admin/coupons", { headers }).then((r) => r.json()).then((d) => {
      setCoupons(Array.isArray(d) ? d as Coupon[] : []);
      setLoad(false);
    });
  }, []);

  async function handleCreate() {
    if (!code.trim() || !name.trim()) { setFormError("Code and name are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method:  "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body:    JSON.stringify({
          code:           code.toUpperCase().trim(),
          name:           name.trim(),
          discountType:   "free_trial_days",
          discountValue:  Number(accessDays),
          accessDays:     Number(accessDays),
          couponType,
          maxRedemptions: maxRed ? Number(maxRed) : null,
          expiresAt:      expires || null,
          note:           note.trim() || null,
        }),
      });
      const data = await res.json() as Coupon & { error?: string };
      if (!res.ok) { setFormError(data.error ?? "Failed to create coupon"); return; }
      setCoupons((prev) => [data, ...prev]);
      setForm(false); resetForm();
    } finally { setSaving(false); }
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method:  "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body:    JSON.stringify({ isActive: !coupon.isActive }),
    });
    if (res.ok) setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
  }

  async function handleLookup() {
    if (!lookupCode.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/admin/coupons/lookup?code=${encodeURIComponent(lookupCode.trim().toUpperCase())}`, { headers });
      setLookupResult(await res.json() as LookupResult);
    } finally { setLookupLoading(false); }
  }

  function typeLabel(t: string) {
    return COUPON_PRESETS[t as CouponTypeName]?.label ?? t;
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">

      {/* ── Lookup section ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Check coupon code</p>
        <div className="flex gap-2">
          <input
            className={fieldCls + " flex-1 font-mono tracking-wider"}
            placeholder="ADJUDO-14D-XXXX"
            value={lookupCode}
            onChange={(e) => { setLookupCode(e.target.value.toUpperCase()); setLookupResult(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") void handleLookup(); }}
          />
          <button
            onClick={() => void handleLookup()}
            disabled={lookupLoading || !lookupCode.trim()}
            className="px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-80 disabled:opacity-40"
          >
            {lookupLoading ? "…" : "Check"}
          </button>
        </div>

        {lookupResult && (
          lookupResult.found && lookupResult.coupon ? (
            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-foreground text-[13px]">{lookupResult.coupon.code}</span>
                <span className="text-muted-foreground text-[12px]">·</span>
                <span className="text-muted-foreground text-[12px]">{typeLabel(lookupResult.coupon.couponType)}</span>
                <span className="text-muted-foreground text-[12px]">·</span>
                <span className="font-medium text-foreground text-[12px]">{lookupResult.coupon.accessDays}d access</span>
                <span className={`ml-auto px-1.5 py-0.5 rounded text-[11px] font-medium ${lookupResult.coupon.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                  {lookupResult.coupon.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground">
                Redeemed: {lookupResult.coupon.currentRedemptions}
                {lookupResult.coupon.maxRedemptions ? ` / ${lookupResult.coupon.maxRedemptions}` : " / ∞"}
                {lookupResult.coupon.expiresAt && <> · Expires: {new Date(lookupResult.coupon.expiresAt).toLocaleDateString()}</>}
              </p>
              {lookupResult.redemptions && lookupResult.redemptions.length > 0 ? (
                <div className="border-t border-border pt-2 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Redemptions</p>
                  {lookupResult.redemptions.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-foreground font-medium">{r.userEmail ?? r.userId}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {r.accessDaysGranted != null && `+${r.accessDaysGranted}d · `}
                        {new Date(r.redeemedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground italic">No redemptions yet.</p>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-muted-foreground">
              No coupon found with code <code className="font-mono bg-muted px-1 rounded">{lookupCode.toUpperCase()}</code>.
            </p>
          )
        )}
      </div>

      {/* ── Create button ───────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={() => { setForm((v) => !v); if (!showForm) resetForm(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={14} />
          New coupon
        </button>
      </div>

      {/* ── Create form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">Create Access Coupon</p>

          {/* Type selector */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-2 block">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(COUPON_PRESETS) as [CouponTypeName, CouponPreset][]).map(([t, p]) => (
                <button key={t} type="button" onClick={() => applyPreset(t)}
                  className={`px-3 py-2 rounded-lg text-left text-[12px] border transition-colors
                    ${couponType === t
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>
                  <span className="font-semibold block">{p.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5 block">{p.days}d · max {p.maxRed} use{p.maxRed !== 1 ? "s" : ""}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code + Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Code *</label>
              <div className="flex gap-1">
                <input className={fieldCls + " flex-1 font-mono text-[12px]"} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <button type="button"
                  onClick={() => setCode(`${COUPON_PRESETS[couponType].prefix}-${genSuffix()}`)}
                  className="px-2 py-1 text-[11px] rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
                  ↺
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Name *</label>
              <input className={fieldCls} placeholder="e.g. Beta tester batch 1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          {/* Access days + Max redemptions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Access days {couponType !== "custom" && <span className="opacity-50">(fixed)</span>}
              </label>
              <input className={fieldCls} type="number" min="1" max="365" value={accessDays}
                disabled={couponType !== "custom"}
                onChange={(e) => setAccessDays(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Max redemptions</label>
              <input className={fieldCls} type="number" min="1" placeholder="Unlimited" value={maxRed} onChange={(e) => setMaxRed(e.target.value)} />
            </div>
          </div>

          {/* Expires + Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Expires at</label>
              <input className={fieldCls} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Note (internal)</label>
              <input className={fieldCls} placeholder="Optional internal note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {formError && <p className="text-[12px] text-red-500">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setForm(false); resetForm(); }}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors">Cancel</button>
            <button onClick={() => void handleCreate()} disabled={saving}
              className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* ── Coupon list ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Code</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Access</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Redeemed</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Expires</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr key={c.id} className={`${i < coupons.length - 1 ? "border-b border-border" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-foreground text-[13px]">{c.code}</p>
                    <p className="text-[11px] text-muted-foreground">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{typeLabel(c.couponType)}</td>
                  <td className="px-4 py-3 text-[13px] font-medium text-foreground">{c.accessDays}d</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {c.currentRedemptions}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium
                      ${c.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => void toggleActive(c)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={c.isActive ? "Deactivate" : "Activate"}>
                      {c.isActive ? <ToggleRightIcon size={16} className="text-primary" /> : <ToggleLeftIcon size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <EmptyRow label="No coupons yet." />}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Feedback ──────────────────────────────────────────────────────────

interface RegionRow {
  country:    string;
  region:     string;
  voteCount:  number;
  postCount:  number;
  lastVoteAt: string | null;
}

function FeedbackAdminTab({ headers }: { headers: Record<string, string> }) {
  const [posts,   setPosts]   = useState<FeedbackPost[]>([]);
  const [regions, setRegions] = useState<RegionRow[]>([]);
  const [loading, setLoad]    = useState(true);
  const [editing, setEditing] = useState<FeedbackPost | null>(null);
  const [note, setNote]       = useState("");
  const [status, setStatus]   = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/feedback",         { headers }).then((r) => r.json()),
      fetch("/api/admin/feedback/regions", { headers }).then((r) => r.json()),
    ]).then(([p, reg]) => {
      setPosts(Array.isArray(p)   ? p   as FeedbackPost[] : []);
      setRegions(Array.isArray(reg) ? reg as RegionRow[]  : []);
      setLoad(false);
    });
  }, []);

  function openEdit(p: FeedbackPost) {
    setEditing(p);
    setNote(p.adminNote ?? "");
    setStatus(p.status);
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    const res = await fetch(`/api/feedback/${editing.id}`, {
      method:  "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body:    JSON.stringify({ adminNote: note || null, status }),
    });
    if (res.ok) {
      const updated = await res.json() as FeedbackPost;
      setPosts((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...updated } : p));
    }
    setEditing(null);
    setSaving(false);
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      {editing && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Edit: {editing.title}</p>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Status</label>
            <select className={fieldCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="released">Released</option>
              <option value="not_planned">Not Planned</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Admin note (shown publicly)</label>
            <textarea
              className={`${fieldCls} min-h-[4rem] resize-none`}
              placeholder="e.g. We're planning to ship this in Q3."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Title</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Votes</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id} className={`${i < posts.length - 1 ? "border-b border-border" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.isPinned && <span className="text-[10px] text-primary font-medium">📌</span>}
                      <span className="font-medium text-foreground text-[13px]">{p.title}</span>
                    </div>
                    {p.adminNote && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{p.adminNote}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium
                      ${p.status === "planned" ? "bg-blue-500/15 text-blue-600" :
                        p.status === "in_progress" ? "bg-purple-500/15 text-purple-600" :
                        p.status === "released" ? "bg-emerald-500/15 text-emerald-600" :
                        "bg-muted text-muted-foreground"}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-[13px] font-medium text-foreground">
                      <ArrowUpIcon size={11} className="text-muted-foreground" />
                      {p.upvoteCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && <EmptyRow label="No feedback posts yet." />}
        </div>
      </div>

      <DevToolsSection headers={headers} />

      {regions.length > 0 && (
        <section className="space-y-3">
          <SectionTitle icon={<MapPinIcon size={13} />} label="Vote Regions" />
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Country</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Region</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Votes</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Posts</th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Last vote</th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r, i) => (
                    <tr key={`${r.country}-${r.region}`} className={`${i < regions.length - 1 ? "border-b border-border" : ""}`}>
                      <td className="px-4 py-3 font-medium text-foreground text-[13px]">{r.country}</td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground">{r.region}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-[13px] font-semibold text-foreground tabular-nums">
                          <ArrowUpIcon size={11} className="text-muted-foreground" />
                          {r.voteCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-muted-foreground tabular-nums">{r.postCount}</td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">
                        {r.lastVoteAt ? relDate(r.lastVoteAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Shared UI ──────────────────────────────────────────────────────────────

const fieldCls = "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40";

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-4 py-6 text-center text-sm text-muted-foreground">{label}</div>
  );
}

// ── Dev Tools ──────────────────────────────────────────────────────────────

function DevToolsSection({ headers }: { headers: Record<string, string> }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg,    setMsg]    = useState("");

  async function seedTestAccount() {
    setStatus("loading");
    setMsg("");
    try {
      const res  = await fetch("/api/admin/seed-test-account", {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...headers },
      });
      const data = await res.json() as { ok?: boolean; uid?: string; email?: string; error?: string; note?: string };
      if (res.ok && data.ok) {
        setStatus("ok");
        setMsg(`✓ UID: ${data.uid ?? "?"} — ${data.note ?? ""}`);
      } else {
        setStatus("error");
        setMsg(data.error ?? "Unknown error");
      }
    } catch (e) {
      setStatus("error");
      setMsg(String(e));
    }
  }

  return (
    <section className="space-y-3">
      <SectionTitle icon={<ShieldIcon size={13} />} label="Dev Tools" />
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div>
          <p className="text-[13px] font-medium text-foreground">Seed Test Account</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            Creates <code className="font-mono bg-muted px-1 rounded text-[11px]">dev@adjudo.com</code> in Firebase Auth + PostgreSQL.
            Requires Email/Password auth enabled in Firebase Console. Safe to run multiple times.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={seedTestAccount}
            disabled={status === "loading"}
            className="px-3 py-1.5 text-[13px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "loading" ? "Creating…" : "Create dev@adjudo.com"}
          </button>
          {msg && (
            <p className={`text-[12px] ${status === "error" ? "text-destructive" : "text-emerald-600"}`}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Tab: Waitlist ───────────────────────────────────────────────────────────

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  useCase: string | null;
  source: string | null;
  createdAt: string;
}

function WaitlistTab({ headers }: { headers: Record<string, string> }) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/waitlist", { headers })
      .then((r) => r.json())
      .then((d) => { setEntries(Array.isArray(d) ? d as WaitlistEntry[] : []); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{entries.length} registered</p>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            ["Email,Name,Role,Use Case,Source,Registered At",
              ...entries.map((e) =>
                [e.email, e.name ?? "", e.role ?? "", e.useCase ?? "", e.source ?? "", e.createdAt].join(",")
              )
            ].join("\n")
          )}`}
          download="waitlist.csv"
          className="text-[11px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          Export CSV
        </a>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <MailIcon size={24} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No waitlist entries yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Role</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Source</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Registered</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id} className={i < entries.length - 1 ? "border-b border-border" : ""}>
                    <td className="px-4 py-3 font-medium text-foreground">{e.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.role ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                        {e.source ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{relDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tabs config ────────────────────────────────────────────────────────────

type TabId = "overview" | "users" | "coupons" | "feedback" | "waitlist";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "overview",  label: "Overview",  icon: <BarChart2Icon size={13} /> },
  { id: "users",     label: "Users",     icon: <UsersIcon size={13} /> },
  { id: "coupons",   label: "Coupons",   icon: <TagIcon size={13} /> },
  { id: "feedback",  label: "Feedback",  icon: <MessageSquareIcon size={13} /> },
  { id: "waitlist",  label: "Waitlist",  icon: <MailIcon size={13} /> },
];

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (!user || !isAdmin) return <Redirect to="/rooms" />;

  const headers: Record<string, string> = { "x-user-id": user.id };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Adjudo Admin</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage Adjudo users, coupons, and feedback.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl border border-border bg-muted/30">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview"  && <OverviewTab      headers={headers} />}
        {activeTab === "users"     && <UsersTab         headers={headers} currentUserId={user.id} />}
        {activeTab === "coupons"   && <CouponsTab       headers={headers} />}
        {activeTab === "feedback"  && <FeedbackAdminTab headers={headers} />}
        {activeTab === "waitlist"  && <WaitlistTab      headers={headers} />}
      </div>
    </div>
  );
}
