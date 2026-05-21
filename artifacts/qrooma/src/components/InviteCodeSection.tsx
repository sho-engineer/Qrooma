import { useState } from "react";
import { CheckIcon, GiftIcon, AlertCircleIcon, Loader2Icon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import { useUserProfile } from "../context/UserProfileContext";

export default function InviteCodeSection() {
  const { t, locale } = useLocale();
  const { profile, applyCode } = useUserProfile();
  const ja = locale === "ja";

  const [code,      setCode]      = useState("");
  const [status,    setStatus]    = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorType, setErrorType] = useState<"invalid" | "already_applied" | "network" | null>(null);

  const alreadyApplied = !!profile.inviteCodeAppliedAt;
  const isUnlimited    = profile.isUnlimitedUser;

  const accessTypeLabel: Record<string, string> = {
    tester:       ja ? "テスター" : "Tester",
    early_access: ja ? "Early Access" : "Early Access",
    special:      ja ? "特典ユーザー" : "Special",
    normal:       ja ? "通常" : "Normal",
  };

  async function handleApply() {
    if (!code.trim() || status === "loading") return;
    setStatus("loading");
    setErrorType(null);

    const result = await applyCode(code.trim());
    if (result.success) {
      setStatus("success");
      setCode("");
    } else {
      setStatus("error");
      if (result.message === "already_applied") setErrorType("already_applied");
      else if (result.message === "network_error") setErrorType("network");
      else setErrorType("invalid");
    }
  }

  function handleCodeChange(v: string) {
    setCode(v.toUpperCase());
    if (status !== "idle") { setStatus("idle"); setErrorType(null); }
  }

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {t.inviteCodeTitle}
      </h3>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">

        {/* ── Already applied ── */}
        {alreadyApplied && (
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 px-4 py-3">
            <CheckIcon size={14} className="text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t.inviteCodeApplied}
              </p>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-500/80">
                {ja
                  ? `アクセスタイプ: ${accessTypeLabel[profile.accessType] ?? profile.accessType}${isUnlimited ? " · 無制限利用" : ""}`
                  : `Access type: ${accessTypeLabel[profile.accessType] ?? profile.accessType}${isUnlimited ? " · Unlimited access" : ""}`}
              </p>
            </div>
          </div>
        )}

        {/* ── Input area (only when not yet applied) ── */}
        {!alreadyApplied && (
          <>
            <div>
              <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">
                {t.inviteCodeDesc}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleApply(); }}
                  placeholder={t.inviteCodePlaceholder}
                  disabled={status === "loading"}
                  className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring font-mono uppercase placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => void handleApply()}
                  disabled={!code.trim() || status === "loading"}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-foreground text-background disabled:opacity-30 hover:opacity-90 transition-all active:scale-[0.97] whitespace-nowrap flex items-center gap-1.5"
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
                  {errorType === "invalid"
                    ? t.inviteCodeInvalid
                    : errorType === "already_applied"
                    ? t.inviteCodeAlreadyApplied
                    : t.inviteCodeNetworkError}
                </p>
              </div>
            )}

            {/* Momentary success */}
            {status === "success" && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 px-3 py-2.5">
                <CheckIcon size={13} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {t.inviteCodeSuccess}
                </p>
              </div>
            )}
          </>
        )}

        {/* ── Footer note ── */}
        <div className="border-t border-border pt-3">
          <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
            {t.inviteCodeNote}
          </p>
        </div>
      </div>
    </section>
  );
}
