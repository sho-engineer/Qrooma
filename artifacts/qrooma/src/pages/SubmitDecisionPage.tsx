import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
const logoA = "/brand/adjudo-wordmark.png";

const WHERE_OPTIONS = ["X / Twitter", "LinkedIn", "Indie Hackers", "Reddit", "Friend", "Other"] as const;
const CONTACT_OPTIONS = ["Email", "X DM", "LinkedIn DM", "Other"] as const;

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-foreground leading-snug">
        {label}
        {required && <span className="text-muted-foreground/50 ml-1 font-normal">*</span>}
      </label>
      {hint && <p className="text-[12px] text-muted-foreground/60 leading-snug -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 text-[14px] bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30 transition-all";
const textareaCls = `${inputCls} resize-none leading-relaxed`;

export default function SubmitDecisionPage() {
  const [urlSource] = useState(() =>
    new URLSearchParams(window.location.search).get("source") ?? ""
  );

  const [form, setForm] = useState({
    name_or_handle:          "",
    email:                   "",
    what_are_you_building:   "",
    decision_to_make:        "",
    options_considered:      "",
    what_happens_if_wrong:   "",
    messy_notes:             "",
    website_url:             "",
    already_tried:           "",
    where_did_you_find:      "",
    preferred_contact_method: "",
    consent_accepted:        false,
    honeypot:                "",
  });

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]  = useState(false);
  const [serverError, setServerError] = useState("");

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name_or_handle.trim())        e.name_or_handle        = "Required";
    if (!form.email.trim())                 e.email                 = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!form.what_are_you_building.trim()) e.what_are_you_building = "Required";
    if (!form.decision_to_make.trim())      e.decision_to_make      = "Required";
    if (!form.options_considered.trim())    e.options_considered    = "Required";
    if (!form.what_happens_if_wrong.trim()) e.what_happens_if_wrong = "Required";
    if (!form.messy_notes.trim())           e.messy_notes           = "Required";
    if (!form.consent_accepted)             e.consent_accepted      = "You must check this to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/checkpoint-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: urlSource || form.where_did_you_find || null }),
      });
      const data = await res.json() as { status?: string; error?: string };
      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 flex items-center">
            <Link href="/">
              <img src={logoA} alt="Adjudo" className="w-[105px] sm:w-[120px] h-auto hover:opacity-70 transition-opacity dark:invert" />
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-24 pb-32">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground mb-8">
            <CheckIcon size={20} className="text-background" />
          </div>
          <h1 className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4" style={{ fontSize: "clamp(1.6rem, 4vw, 2.25rem)" }}>
            Decision submitted.
          </h1>
          <p className="text-[16px] text-muted-foreground leading-relaxed mb-6 max-w-lg">
            We'll review your submission for fit. If it's a good fit, we'll send you a $9 payment link — your AI-generated Decision Checkpoint is delivered right after payment.
          </p>
          <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-md">
            If you don't hear from us within a few days, the decision may not have been a good fit for this format. You won't be charged unless we reach out.
          </p>
          <div className="mt-10">
            <Link href="/">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
                Back to Adjudo
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <img src={logoA} alt="Adjudo" className="w-[105px] sm:w-[120px] h-auto hover:opacity-70 transition-opacity dark:invert" />
          </Link>
          <Link href="/sample-decision-checkpoint">
            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/60 hover:border-border transition-all duration-150 whitespace-nowrap">
              See a sample
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
          Decision Checkpoint · $9 paid beta
        </p>
        <h1 className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-3" style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)" }}>
          Submit your decision
        </h1>
        <p className="text-[14px] text-muted-foreground leading-relaxed max-w-lg">
          Paid beta. No account needed. We review each submission for fit and only send a $9 payment link if it qualifies.
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Hidden honeypot */}
        <input
          type="text"
          name="honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
          value={form.honeypot}
          onChange={(e) => set("honeypot", e.target.value)}
        />

        <div className="max-w-2xl mx-auto px-5 sm:px-8 pb-24 space-y-10">

          {/* ── About you ──────────────────────────────────────────────── */}
          <section className="space-y-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 pb-1 border-b border-border">
              About you
            </p>

            <Field label="Name or handle" required>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Alex or @alex"
                value={form.name_or_handle}
                onChange={(e) => set("name_or_handle", e.target.value)}
              />
              {errors.name_or_handle && <p className="text-[12px] text-red-500">{errors.name_or_handle}</p>}
            </Field>

            <Field label="Email" required hint="We'll only use this to send your payment link or follow up.">
              <input
                type="email"
                className={inputCls}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              {errors.email && <p className="text-[12px] text-red-500">{errors.email}</p>}
            </Field>

            <Field label="What are you building?" required hint="One sentence is fine.">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. A B2B SaaS tool for freelance designers"
                value={form.what_are_you_building}
                onChange={(e) => set("what_are_you_building", e.target.value)}
              />
              {errors.what_are_you_building && <p className="text-[12px] text-red-500">{errors.what_are_you_building}</p>}
            </Field>

            <Field label="Website / product URL" hint="Optional.">
              <input
                type="url"
                className={inputCls}
                placeholder="https://..."
                value={form.website_url}
                onChange={(e) => set("website_url", e.target.value)}
              />
            </Field>
          </section>

          {/* ── The decision ───────────────────────────────────────────── */}
          <section className="space-y-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 pb-1 border-b border-border">
              The decision
            </p>

            <Field label="What decision are you trying to make?" required hint="Be specific — what exactly is the choice in front of you?">
              <textarea
                rows={3}
                className={textareaCls}
                placeholder="e.g. Should I build the onboarding flow first, or launch a landing page and validate demand?"
                value={form.decision_to_make}
                onChange={(e) => set("decision_to_make", e.target.value)}
              />
              {errors.decision_to_make && <p className="text-[12px] text-red-500">{errors.decision_to_make}</p>}
            </Field>

            <Field label="What options are you considering?" required hint="List the actual options you're weighing.">
              <textarea
                rows={3}
                className={textareaCls}
                placeholder="Option A: …&#10;Option B: …"
                value={form.options_considered}
                onChange={(e) => set("options_considered", e.target.value)}
              />
              {errors.options_considered && <p className="text-[12px] text-red-500">{errors.options_considered}</p>}
            </Field>

            <Field label="What would happen if you choose wrong?" required hint="What's the real cost of a bad decision here?">
              <textarea
                rows={2}
                className={textareaCls}
                placeholder="e.g. I'd waste 3 weeks building something nobody wants"
                value={form.what_happens_if_wrong}
                onChange={(e) => set("what_happens_if_wrong", e.target.value)}
              />
              {errors.what_happens_if_wrong && <p className="text-[12px] text-red-500">{errors.what_happens_if_wrong}</p>}
            </Field>

            <Field label="What have you already tried?" hint="Optional — what research, advice, or AI outputs have you already used?">
              <textarea
                rows={2}
                className={textareaCls}
                placeholder="e.g. Asked ChatGPT, talked to 2 potential users…"
                value={form.already_tried}
                onChange={(e) => set("already_tried", e.target.value)}
              />
            </Field>
          </section>

          {/* ── Context ────────────────────────────────────────────────── */}
          <section className="space-y-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 pb-1 border-b border-border">
              Context
            </p>

            <Field
              label="Messy notes / AI outputs / context"
              required
              hint="Paste anything relevant — prior research, AI chats, your own notes. The more context, the better the review."
            >
              <textarea
                rows={8}
                className={textareaCls}
                placeholder="Paste notes, AI outputs, or anything that captures where you're at with this decision…"
                value={form.messy_notes}
                onChange={(e) => set("messy_notes", e.target.value)}
              />
              {errors.messy_notes && <p className="text-[12px] text-red-500">{errors.messy_notes}</p>}
            </Field>
          </section>

          {/* ── Optional ───────────────────────────────────────────────── */}
          <section className="space-y-5">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 pb-1 border-b border-border">
              Optional
            </p>

            <Field label="Where did you find Adjudo?">
              <select
                className={`${inputCls} appearance-none cursor-pointer`}
                value={form.where_did_you_find}
                onChange={(e) => set("where_did_you_find", e.target.value)}
              >
                <option value="">Select…</option>
                {WHERE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>

            <Field label="Preferred contact method">
              <select
                className={`${inputCls} appearance-none cursor-pointer`}
                value={form.preferred_contact_method}
                onChange={(e) => set("preferred_contact_method", e.target.value)}
              >
                <option value="">Select…</option>
                {CONTACT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </section>

          {/* ── Consent + Submit ───────────────────────────────────────── */}
          <section className="space-y-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`shrink-0 mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-all duration-150 ${form.consent_accepted ? "bg-foreground border-foreground" : "bg-background border-border group-hover:border-foreground/40"}`}>
                {form.consent_accepted && <CheckIcon size={11} className="text-background" strokeWidth={3} />}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={form.consent_accepted}
                onChange={(e) => set("consent_accepted", e.target.checked)}
              />
              <span className="text-[13px] text-muted-foreground leading-relaxed">
                I understand this is a paid beta and my submission will be reviewed for fit. My notes won't be shared publicly without permission.
                <span className="text-muted-foreground/50"> *</span>
              </span>
            </label>
            {errors.consent_accepted && <p className="text-[12px] text-red-500 -mt-2">{errors.consent_accepted}</p>}

            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
                {serverError}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-foreground text-background font-semibold rounded-full px-7 py-3 text-[15px] hover:opacity-85 active:scale-[0.97] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : <>Submit your decision <ArrowRightIcon size={14} /></>}
              </button>
            </div>

            <p className="text-[12px] text-muted-foreground/50 leading-relaxed max-w-md">
              If your decision is a good fit, we'll send a $9 payment link. After payment, your Decision Checkpoint will be delivered within 48 hours. You won't be charged unless we reach out.
            </p>
          </section>
        </div>
      </form>
    </div>
  );
}
