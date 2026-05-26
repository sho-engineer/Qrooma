import { useState, useEffect, useCallback } from "react";
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
}

interface DBUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt: string;
  lastActiveAt: string;
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

function UsersTab({ headers }: { headers: Record<string, string> }) {
  const [users, setUsers]   = useState<DBUser[]>([]);
  const [loading, setLoad]  = useState(true);
  const [updating, setUpd]  = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users", { headers }).then((r) => r.json()).then((d) => { setUsers(d as DBUser[]); setLoad(false); });
  }, []);

  async function toggleRole(u: DBUser) {
    const newRole = u.role === "admin" ? "user" : "admin";
    setUpd(u.id);
    const res = await fetch(`/api/admin/users/${u.id}/role`, {
      method:  "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body:    JSON.stringify({ role: newRole }),
    });
    if (res.ok) setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: newRole } : x));
    setUpd(null);
  }

  if (loading) return <Spinner />;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">User</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Role</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Joined</th>
              <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Last active</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={`${i < users.length - 1 ? "border-b border-border" : ""}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{u.name}</p>
                  <p className="text-[12px] text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium
                    ${u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {u.role === "admin" ? <ShieldIcon size={10} /> : <UserIcon size={10} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">{relDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground">{relDate(u.lastActiveAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleRole(u)}
                    disabled={updating === u.id}
                    className="text-[12px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {u.role === "admin" ? "Make user" : "Make admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <EmptyRow label="No users yet." />}
      </div>
    </div>
  );
}

// ── Tab: Coupons ───────────────────────────────────────────────────────────

function CouponsTab({ headers }: { headers: Record<string, string> }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoad]    = useState(true);
  const [showForm, setForm]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [formError, setFormError] = useState("");

  const [code, setCode]       = useState("");
  const [name, setName]       = useState("");
  const [desc, setDesc]       = useState("");
  const [dtype, setDtype]     = useState<"percentage" | "fixed_amount" | "free_trial_days">("percentage");
  const [dvalue, setDvalue]   = useState("20");
  const [maxRed, setMaxRed]   = useState("");
  const [expires, setExpires] = useState("");

  function resetForm() {
    setCode(""); setName(""); setDesc(""); setDtype("percentage");
    setDvalue("20"); setMaxRed(""); setExpires(""); setFormError("");
  }

  useEffect(() => {
    fetch("/api/admin/coupons", { headers }).then((r) => r.json()).then((d) => { setCoupons(d as Coupon[]); setLoad(false); });
  }, []);

  async function handleCreate() {
    if (!code.trim() || !name.trim() || !dvalue) { setFormError("Code, name, and discount value are required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method:  "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body:    JSON.stringify({
          code: code.toUpperCase().trim(),
          name: name.trim(),
          description: desc.trim() || null,
          discountType:  dtype,
          discountValue: Number(dvalue),
          maxRedemptions: maxRed ? Number(maxRed) : null,
          expiresAt: expires || null,
        }),
      });
      const data = await res.json() as Coupon & { error?: string };
      if (!res.ok) { setFormError(data.error ?? "Failed to create coupon"); return; }
      setCoupons((prev) => [data, ...prev]);
      setForm(false);
      resetForm();
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

  function discountLabel(c: Coupon) {
    if (c.discountType === "percentage")      return `${c.discountValue}% off`;
    if (c.discountType === "fixed_amount")    return `${c.currency ?? "$"}${c.discountValue} off`;
    if (c.discountType === "free_trial_days") return `${c.discountValue} days free`;
    return String(c.discountValue);
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setForm((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <PlusIcon size={14} />
          New coupon
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Create Coupon</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Code *</label>
              <input className={fieldCls} placeholder="LAUNCH20" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Name *</label>
              <input className={fieldCls} placeholder="Launch discount" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Discount Type</label>
              <select className={fieldCls} value={dtype} onChange={(e) => setDtype(e.target.value as typeof dtype)}>
                <option value="percentage">Percentage off</option>
                <option value="fixed_amount">Fixed amount off</option>
                <option value="free_trial_days">Free trial days</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Value *</label>
              <input className={fieldCls} type="number" placeholder="20" value={dvalue} onChange={(e) => setDvalue(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Max redemptions</label>
              <input className={fieldCls} type="number" placeholder="Unlimited" value={maxRed} onChange={(e) => setMaxRed(e.target.value)} />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Expires at</label>
              <input className={fieldCls} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Description</label>
            <input className={fieldCls} placeholder="Optional description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          {formError && <p className="text-[12px] text-red-500">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setForm(false); resetForm(); }} className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-lg transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Code</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Discount</th>
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
                  <td className="px-4 py-3 text-[13px] font-medium text-foreground">{discountLabel(c)}</td>
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
                    <button
                      onClick={() => toggleActive(c)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={c.isActive ? "Deactivate" : "Activate"}
                    >
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
      setPosts(p as FeedbackPost[]);
      setRegions(reg as RegionRow[]);
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
      .then((d) => { setEntries(d as WaitlistEntry[]); setLoading(false); });
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
        {activeTab === "users"     && <UsersTab         headers={headers} />}
        {activeTab === "coupons"   && <CouponsTab       headers={headers} />}
        {activeTab === "feedback"  && <FeedbackAdminTab headers={headers} />}
        {activeTab === "waitlist"  && <WaitlistTab      headers={headers} />}
      </div>
    </div>
  );
}
