import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import {
  ThumbsUpIcon, PlusIcon, XIcon,
  PinIcon, SparklesIcon, BugIcon, ZapIcon, DollarSignIcon,
  BarChart2Icon, HelpCircleIcon, ArrowUpIcon, ArrowRightIcon,
} from "lucide-react";

const logoA = "/brand/adjudo-wordmark.png";

// ── Types ──────────────────────────────────────────────────────────────────

type FeedbackStatus   = "under_review" | "planned" | "in_progress" | "released" | "not_planned";
type FeedbackCategory = "feature_request" | "improvement" | "bug" | "integration" | "pricing" | "other";

interface FeedbackPost {
  id:                 string;
  userId:             string;
  title:              string;
  description:        string;
  status:             FeedbackStatus;
  category:           FeedbackCategory | null;
  adminNote:          string | null;
  adminPriorityNote:  string | null;
  upvoteCount:        number;
  isHidden:           boolean;
  isPinned:           boolean;
  isRoadmapCandidate: boolean;
  roadmapPriority:    string | null;
  voteThreshold:      number | null;
  costSensitive:      boolean;
  createdAt:          string;
  updatedAt:          string;
  hasVoted:           boolean;
}

// ── Category icons (not locale-dependent) ──────────────────────────────────

const CATEGORY_ICONS: Record<FeedbackCategory, React.ReactNode> = {
  feature_request: <SparklesIcon size={11} />,
  improvement:     <ZapIcon size={11} />,
  bug:             <BugIcon size={11} />,
  integration:     <BarChart2Icon size={11} />,
  pricing:         <DollarSignIcon size={11} />,
  other:           <HelpCircleIcon size={11} />,
};

const LS_VOTED_KEY = "adjudo_voted_posts";

function getLocalVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_VOTED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}
function addLocalVoted(id: string) {
  const s = getLocalVotedIds();
  s.add(id);
  localStorage.setItem(LS_VOTED_KEY, JSON.stringify([...s]));
}
function removeLocalVoted(id: string) {
  const s = getLocalVotedIds();
  s.delete(id);
  localStorage.setItem(LS_VOTED_KEY, JSON.stringify([...s]));
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const { t } = useLocale();
  const LABELS: Record<FeedbackStatus, { label: string; color: string }> = {
    under_review: { label: t.feedbackStatusUnderReview, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
    planned:      { label: t.feedbackStatusPlanned,     color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
    in_progress:  { label: t.feedbackStatusInProgress,  color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
    released:     { label: t.feedbackStatusReleased,    color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    not_planned:  { label: t.feedbackStatusNotPlanned,  color: "bg-zinc-500/15 text-zinc-500" },
  };
  const { label, color } = LABELS[status] ?? { label: status, color: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${color}`}>
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: FeedbackCategory }) {
  const { t } = useLocale();
  const CAT_LABELS: Record<FeedbackCategory, string> = {
    feature_request: t.feedbackCatFeatureRequest,
    improvement:     t.feedbackCatImprovement,
    bug:             t.feedbackCatBug,
    integration:     t.feedbackCatIntegration,
    pricing:         t.feedbackCatPricing,
    other:           t.feedbackCatOther,
  };
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted/60 text-muted-foreground">
      {CATEGORY_ICONS[category]}
      {CAT_LABELS[category]}
    </span>
  );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-medium">{value} / {max}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-foreground/60 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PostCard({
  post,
  onVote,
  onExpand,
}: {
  post:     FeedbackPost;
  onVote:   (id: string) => void;
  onExpand: (post: FeedbackPost) => void;
}) {
  const { t } = useLocale();
  return (
    <div
      className={`group relative rounded-xl border bg-card p-4 transition-all hover:border-border/80 hover:shadow-sm cursor-pointer
        ${post.isPinned ? "border-primary/30 ring-1 ring-primary/10" : "border-border"}`}
      onClick={() => onExpand(post)}
    >
      {post.isPinned && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-primary/70 font-medium">
          <PinIcon size={9} className="rotate-45" />
          {t.feedbackPinnedBadge}
        </span>
      )}

      <div className="flex gap-3">
        <button
          onClick={(e) => { e.stopPropagation(); onVote(post.id); }}
          className={`flex flex-col items-center gap-0.5 min-w-[2.5rem] pt-0.5 rounded-lg p-1.5 border transition-all shrink-0
            ${post.hasVoted
              ? "border-primary bg-primary/8 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
        >
          <ArrowUpIcon size={14} strokeWidth={2.5} />
          <span className="text-[12px] font-semibold leading-none">{post.upvoteCount}</span>
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug pr-12">{post.title}</p>
          <p className="mt-1 text-[13px] text-muted-foreground line-clamp-2 leading-relaxed">{post.description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={post.status} />
            {post.category && <CategoryBadge category={post.category} />}
            {post.costSensitive && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium">
                <DollarSignIcon size={9} />
                {t.feedbackCostSensitive}
              </span>
            )}
          </div>

          {post.isPinned && post.voteThreshold && (
            <ProgressBar
              value={post.upvoteCount}
              max={post.voteThreshold}
              label={t.feedbackVotesNeededLabel}
            />
          )}

          {post.adminNote && (
            <div className="mt-2 px-2.5 py-2 rounded-lg bg-muted/50 border border-border/60">
              <p className="text-[12px] text-muted-foreground">
                <span className="font-medium text-foreground">{t.feedbackNotePrefix}</span>
                {post.adminNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email vote modal (anonymous users) ─────────────────────────────────────

function EmailVoteModal({
  onClose,
  onSubmit,
}: {
  onClose:  () => void;
  onSubmit: (email: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError(t.feedbackEmailRequired); return; }
    setLoading(true);
    try {
      await onSubmit(email.trim().toLowerCase());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.feedbackVoteError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t.feedbackVoteModalTitle}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <XIcon size={16} className="text-muted-foreground" />
          </button>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {t.feedbackVoteModalBody}
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(""); }}
          placeholder={t.feedbackVoteEmailPlaceholder}
          required
          autoFocus
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
        />
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            {t.feedbackCancelBtn}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50"
          >
            {loading ? t.feedbackVotingBtn : t.feedbackVoteSubmitBtn}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Submit modal ────────────────────────────────────────────────────────────

function SubmitModal({
  onClose,
  onSubmit,
}: {
  onClose:  () => void;
  onSubmit: (title: string, description: string, category: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const CAT_OPTIONS: { value: FeedbackCategory; label: string }[] = [
    { value: "feature_request", label: t.feedbackCatFeatureRequest },
    { value: "improvement",     label: t.feedbackCatImprovement },
    { value: "bug",             label: t.feedbackCatBug },
    { value: "integration",     label: t.feedbackCatIntegration },
    { value: "pricing",         label: t.feedbackCatPricing },
    { value: "other",           label: t.feedbackCatOther },
  ];

  const [title,    setTitle]    = useState("");
  const [desc,     setDesc]     = useState("");
  const [category, setCategory] = useState("feature_request");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit() {
    if (!title.trim() || !desc.trim()) { setError(t.feedbackTitleDescRequired); return; }
    setLoading(true);
    try {
      await onSubmit(title.trim(), desc.trim(), category);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.feedbackVoteError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{t.feedbackSubmitModalTitle}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <XIcon size={16} className="text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">{t.feedbackTitleLabel}</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              placeholder={t.feedbackTitlePlaceholder}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              maxLength={120}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">{t.feedbackDescLabel}</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 min-h-[6rem] resize-none"
              placeholder={t.feedbackDescPlaceholder}
              value={desc}
              onChange={(e) => { setDesc(e.target.value); setError(""); }}
              maxLength={1000}
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-foreground mb-1 block">{t.feedbackCategoryLabel}</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CAT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
        </div>
        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors">
            {t.feedbackCancelBtn}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? t.feedbackSubmittingBtn : t.feedbackSubmitBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail modal ────────────────────────────────────────────────────────────

function DetailModal({ post, onClose, onVote }: { post: FeedbackPost; onClose: () => void; onVote: (id: string) => void }) {
  const { t } = useLocale();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-base font-semibold text-foreground leading-snug">{post.title}</h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <StatusBadge status={post.status} />
              {post.category && <CategoryBadge category={post.category} />}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors shrink-0">
            <XIcon size={16} className="text-muted-foreground" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.description}</p>

        {post.adminNote && (
          <div className="px-3 py-2.5 rounded-lg bg-muted/50 border border-border/60 space-y-1">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">{t.feedbackNotePrefix}</p>
            <p className="text-[13px] text-muted-foreground">{post.adminNote}</p>
          </div>
        )}

        {post.isPinned && post.voteThreshold && (
          <ProgressBar
            value={post.upvoteCount}
            max={post.voteThreshold}
            label={t.feedbackVotesNeededLabel}
          />
        )}

        <button
          onClick={() => { onVote(post.id); onClose(); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all
            ${post.hasVoted
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5"}`}
        >
          <ArrowUpIcon size={14} />
          {post.hasVoted ? t.feedbackRemoveVote : t.feedbackUpvoteBtn} · {post.upvoteCount}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const { user } = useAuth();
  const { t } = useLocale();

  const [posts,         setPosts]         = useState<FeedbackPost[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [statusFilter,  setStatus]        = useState("");
  const [sort,          setSort]          = useState("votes");
  const [showSubmit,    setShowSubmit]    = useState(false);
  const [expanded,      setExpanded]      = useState<FeedbackPost | null>(null);
  const [hasError,      setHasError]      = useState(false);
  const [pendingVoteId, setPendingVoteId] = useState<string | null>(null);
  const [anonEmail,     setAnonEmail]     = useState(() => localStorage.getItem("adjudo_anon_email") || "");

  const SORT_OPTIONS = [
    { value: "votes",  label: t.feedbackMostVoted },
    { value: "newest", label: t.feedbackNewest },
  ];

  const STATUS_FILTER_OPTIONS = [
    { value: "",             label: t.feedbackAllStatuses },
    { value: "under_review", label: t.feedbackStatusUnderReview },
    { value: "planned",      label: t.feedbackStatusPlanned },
    { value: "in_progress",  label: t.feedbackStatusInProgress },
    { value: "released",     label: t.feedbackStatusReleased },
    { value: "not_planned",  label: t.feedbackStatusNotPlanned },
  ];

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("sort", sort);
      const storedEmail = localStorage.getItem("adjudo_anon_email");
      if (!user && storedEmail) params.set("voter_email", storedEmail);

      const res = await fetch(`/api/feedback?${params}`, {
        headers: user ? { "x-user-id": user.id } : {},
      });
      if (!res.ok) throw new Error("Failed to load feedback");
      const data = await res.json() as FeedbackPost[];

      if (!user) {
        const localVoted = getLocalVotedIds();
        setPosts(data.map((p) => ({ ...p, hasVoted: p.hasVoted || localVoted.has(p.id) })));
      } else {
        setPosts(data);
      }
    } catch {
      setHasError(true);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sort, user]);

  useEffect(() => { void fetchPosts(); }, [fetchPosts]);

  async function doVote(id: string, voterEmail?: string) {
    const headers: Record<string, string> = {};
    const body: Record<string, string | undefined> = {};

    if (user) {
      headers["x-user-id"] = user.id;
    } else if (voterEmail) {
      body["voter_email"] = voterEmail;
    }

    body["locale"]   = navigator.language ?? undefined;
    body["timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone ?? undefined;

    const res = await fetch(`/api/feedback/${id}/vote`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Vote failed");
    const { voted } = await res.json() as { voted: boolean };

    if (!user && voterEmail) {
      voted ? addLocalVoted(id) : removeLocalVoted(id);
      localStorage.setItem("adjudo_anon_email", voterEmail);
      setAnonEmail(voterEmail);
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, hasVoted: voted, upvoteCount: voted ? p.upvoteCount + 1 : p.upvoteCount - 1 }
          : p
      )
    );
    setExpanded((prev) =>
      prev?.id === id
        ? { ...prev, hasVoted: voted, upvoteCount: voted ? prev.upvoteCount + 1 : prev.upvoteCount - 1 }
        : prev
    );
  }

  function handleVote(id: string) {
    if (user) { void doVote(id); return; }
    const localVoted = getLocalVotedIds();
    if (localVoted.has(id) && anonEmail) { void doVote(id, anonEmail); return; }
    if (anonEmail) { void doVote(id, anonEmail); return; }
    setPendingVoteId(id);
  }

  async function handleAnonEmailSubmit(email: string) {
    if (!pendingVoteId) return;
    await doVote(pendingVoteId, email);
    setPendingVoteId(null);
  }

  async function handleSubmit(title: string, description: string, category: string) {
    if (!user) throw new Error(t.feedbackLoginRequired);
    const res = await fetch("/api/feedback", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-user-id": user.id },
      body:    JSON.stringify({ title, description, category }),
    });
    if (!res.ok) {
      const data = await res.json() as { error?: string };
      throw new Error(data.error ?? t.feedbackVoteError);
    }
    await fetchPosts();
  }

  const pinned  = posts.filter((p) => p.isPinned);
  const regular = posts.filter((p) => !p.isPinned);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/">
            <img src={logoA} alt="Adjudo" className="h-5 w-auto dark:invert hover:opacity-70 transition-opacity" />
          </Link>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/rooms">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t.feedbackBackToRooms}
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t.feedbackLoginLink}
                  </button>
                </Link>
                <Link href="/waitlist">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-all">
                    {t.feedbackJoinWaitlistBtn} <ArrowRightIcon size={11} />
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">{t.feedbackPageTitle}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
              {t.feedbackPageSub}
            </p>
          </div>
          {user ? (
            <button
              onClick={() => setShowSubmit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              <PlusIcon size={14} />
              {t.feedbackSuggestBtn}
            </button>
          ) : (
            <Link href="/login">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all shrink-0">
                <PlusIcon size={14} />
                {t.feedbackSuggestBtn}
              </button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
                className={`px-2.5 py-1.5 text-sm transition-colors
                  ${sort === o.value
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {hasError && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500">
            {t.feedbackLoadError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Pinned posts */}
            {pinned.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5">
                  <PinIcon size={9} className="rotate-45" />
                  {t.feedbackPinnedSection}
                </p>
                <div className="space-y-2">
                  {pinned.map((p) => (
                    <PostCard key={p.id} post={p} onVote={handleVote} onExpand={setExpanded} />
                  ))}
                </div>
              </div>
            )}

            {pinned.length > 0 && regular.length > 0 && (
              <div className="border-t border-border" />
            )}

            {/* Community posts */}
            {regular.length > 0 && (
              <div className="space-y-2">
                {pinned.length > 0 && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {t.feedbackCommunitySection}
                  </p>
                )}
                {regular.map((p) => (
                  <PostCard key={p.id} post={p} onVote={handleVote} onExpand={setExpanded} />
                ))}
              </div>
            )}

            {posts.length === 0 && (
              <div className="text-center py-16 space-y-2">
                <ThumbsUpIcon className="mx-auto text-muted-foreground/30" size={32} />
                <p className="text-sm text-muted-foreground">{t.feedbackEmpty}</p>
              </div>
            )}
          </>
        )}

        {/* Waitlist nudge for non-logged-in users */}
        {!user && !loading && (
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-[12px] text-muted-foreground/60 mb-2">
              {t.feedbackWaitlistNudge}
            </p>
            <Link href="/waitlist">
              <span className="text-[12px] text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer">
                {t.feedbackJoinWaitlistLink}
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      {pendingVoteId && (
        <EmailVoteModal
          onClose={() => setPendingVoteId(null)}
          onSubmit={handleAnonEmailSubmit}
        />
      )}
      {showSubmit && (
        <SubmitModal onClose={() => setShowSubmit(false)} onSubmit={handleSubmit} />
      )}
      {expanded && (
        <DetailModal post={expanded} onClose={() => setExpanded(null)} onVote={handleVote} />
      )}
    </div>
  );
}
