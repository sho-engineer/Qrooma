import { useState } from "react";
import { CheckIcon, GiftIcon, AlertCircleIcon, Loader2Icon, CalendarIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import { useUserProfile, isFullAccessActive } from "../context/UserProfileContext";

export default function InviteCodeSection() {
  const { t, locale } = useLocale();
  const { profile, applyCode } = useUserProfile();
  const ja = locale === "ja";

  const [code,      setCode]      = useState("");
  const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorType, setErrorType] = useState<"invalid" | "already_used" | "network" | null>(null);
  const [lastDays,  setLastDays]  = useState<number | null>(null);

  const hasFullAccess = isFullAccessActive(profile);
  const isUnlimited   = profile.isUnlimitedUser;

  const accessTypeLabel: Record<string, string> = {
    tester:       ja ? "テスター" : "Tester",
    early_access: ja ? "Early Access" : "Early Access",
    special:      ja ? "特典ユーザー" : "Special",
    normal:       ja ? "通常" : "Normal",
  };

  function fmtDate(iso: string) {
    const d = new Date(iso);
    return ja
      ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  async function handleApply() {
    if (!code.trim() || status === "loading") return;
    setStatus("loading");
    setErrorType(null);
    setLastDays(null);

    const result = await applyCode(code.trim());
    if (result.success) {
      setStatus("success");
      setCode("");
    } else {
      setStatus("error");
      if (result.message === "already_used") setErrorType("already_used");
      else if (result.message === "network_error") setErrorType("network");
      else setErrorType("invalid");
    }
  }

  function handleCodeChange(v: string) {
    setCode(v.toUpperCase());
    if (status !== "idle") { setStatus("idle"); setErrorType(null); setLastDays(null); }
  }

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {t.inviteCodeTitle}
      </h3>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">

        {/* ── Full access active banner ── */}
        {hasFullAccess && profile.fullAccessExpiresAt && (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-3">
            <CalendarIcon size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {ja ? "フルアクセス有効中" : "Full Access Active"}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
                {ja
                  ? `有効期限: ${fmtDate(profile.fullAccessExpiresAt)} · 制限なしで利用可能`
                  : `Expires ${fmtDate(profile.fullAccessExpiresAt)} · No usage limits`}
              </p>
            </div>
          </div>
        )}

        {/* ── Unlimited invite code applied ── */}
        {!hasFullAccess && isUnlimited && profile.inviteCodeAppliedAt && (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-3">
            <CheckIcon size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t.inviteCodeApplied}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
                {ja
                  ? `アクセスタイプ: ${accessTypeLabel[profile.accessType] ?? profile.accessType} · 無制限利用`
                  : `Access type: ${accessTypeLabel[profile.accessType] ?? profile.accessType} · Unlimited access`}
              </p>
            </div>
          </div>
        )}

        {/* ── Input area — always visible unless unlimited invite already applied ── */}
        {!isUnlimited && (
          <>
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleApply(); }}
                  placeholder={ja ? "コードを入力" : "Enter code"}
                  disabled={status === "loading"}
                  className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-600 rounded-xl outline-none focus:border-zinc-500 dark:focus:border-zinc-400 font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100"
                />
                <button
                  onClick={() => void handleApply()}
                  disabled={!code.trim() || status === "loading"}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-30 hover:opacity-85 transition-all active:scale-[0.97] whitespace-nowrap flex items-center gap-1.5"
                >
                  {status === "loading"
                    ? <Loader2Icon size={12} className="animate-spin" />
                    : <GiftIcon size={12} />}
                  {t.inviteCodeApply}
                </button>
              </div>
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-3 py-2.5">
                <AlertCircleIcon size={13} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-[11px] text-destructive/90 leading-relaxed">
                  {errorType === "already_used"
                    ? (ja ? "このコードは既に使用されています。" : "This code has already been used.")
                    : errorType === "network"
                    ? t.inviteCodeNetworkError
                    : t.inviteCodeInvalid}
                </p>
              </div>
            )}

            {/* Success */}
            {status === "success" && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 px-3 py-2.5">
                <CheckIcon size={13} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {lastDays !== null
                    ? (ja ? `+${lastDays}日のフルアクセスを追加しました。` : `+${lastDays} days of full access added.`)
                    : t.inviteCodeSuccess}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Footer note ── */}
        <div className="border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
            {ja
              ? "各コードは1回のみ利用可能です。複数コードの併用で最大30日まで延長できます。"
              : "Each code can only be used once. Stack multiple codes to extend access up to 30 days."}
          </p>
        </div>
      </div>
    </section>
  );
}
