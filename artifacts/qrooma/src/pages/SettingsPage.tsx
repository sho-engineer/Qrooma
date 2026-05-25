import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import { usePlan } from "../context/PlanContext";
import { useUserProfile } from "../context/UserProfileContext";
import { usageService } from "../services/usageService";
import type { WritingTone, ConclusionFormat, JpHardness, WritingStyle } from "../types";
import { CheckIcon } from "lucide-react";
import InviteCodeSection from "../components/InviteCodeSection";

// ─── Plan Cards ───────────────────────────────────────────────────────────────

function FreePlanCard() {
  const { locale, t } = useLocale();
  const { profile }   = useUserProfile();
  const isJa          = locale === "ja";

  const dailyUsed    = usageService.getDailyCount();
  const monthlyUsed  = usageService.getMonthlyCount();
  const dailyLimit   = profile.dailyRunLimit;
  const monthlyLimit = profile.monthlyRunLimit;
  const isUnlimited  = profile.isUnlimitedUser;

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {isJa ? "現在のプラン" : "Current plan"}
      </h3>

      <div className="rounded-2xl border border-border bg-card p-5 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Free</span>
          {profile.accessType !== "normal" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 capitalize">
              {profile.accessType.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="rounded-xl bg-muted/30 px-3 py-2.5 space-y-2 mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
            {isJa ? "利用状況" : "Usage"}
          </p>
          {isUnlimited ? (
            <p className="text-xs font-medium text-emerald-600">{t.usageUnlimited}</p>
          ) : (
            <>
              {dailyLimit !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-foreground/70">
                    {t.usageTodayRemaining(dailyUsed, dailyLimit)}
                  </span>
                  <div className="flex gap-0.5 ml-2">
                    {Array.from({ length: dailyLimit }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-1.5 rounded-full ${i < dailyUsed ? "bg-foreground/25" : "bg-foreground/60"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {monthlyLimit !== null && (
                <p className="text-[10px] text-muted-foreground/50">
                  {t.usageMonthly(monthlyUsed, monthlyLimit)}
                </p>
              )}
            </>
          )}
        </div>

        <div className="rounded-xl bg-muted/30 px-3 py-2.5 space-y-1.5 mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
            {isJa ? "固定の2エージェント構成" : "Fixed 2-agent config"}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] shrink-0" />
            <span className="text-[11px] text-foreground/70">{isJa ? "Builder（候補提案）" : "Builder"}</span>
            <span className="ml-auto text-[11px] font-mono text-muted-foreground/60">GPT-4o mini</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
            <span className="text-[11px] text-foreground/70">{isJa ? "Breaker（検証・反証）" : "Breaker"}</span>
            <span className="ml-auto text-[11px] font-mono text-muted-foreground/60">GPT-4o mini</span>
          </div>
        </div>

        {!isUnlimited && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground text-[11px] shrink-0 mt-px">i</span>
            <span className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isJa
                ? "1日5回・月100回まで。継続議論は1回まで。"
                : "5 runs/day · 100 runs/month (fair use) · 1 continuation per discussion."}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          {isJa
            ? "Pro / Connect は近日公開予定です。現在は Free プランのみ提供中です。"
            : "Pro and Connect plans are coming soon. The Free plan is available now."}
        </p>
      </div>
    </section>
  );
}

// ─── WritingStyleSection ──────────────────────────────────────────────────────

function OptionButton({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 active:scale-[0.99] ${
        active
          ? "border-foreground/20 bg-card"
          : "border-border bg-background hover:bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {active && <CheckIcon size={11} className="text-foreground/50 shrink-0" />}
      </div>
      {desc && (
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed">{desc}</p>
      )}
    </button>
  );
}

function WritingStyleSection({
  value,
  onChange,
}: {
  value:    WritingStyle;
  onChange: (ws: WritingStyle) => void;
}) {
  const { t, locale } = useLocale();

  function patch(partial: Partial<WritingStyle>) {
    onChange({ ...value, ...partial });
  }

  const tones: { v: WritingTone; label: string; desc: string }[] = [
    { v: "natural",      label: t.writingToneNatural,      desc: t.writingToneNaturalDesc      },
    { v: "professional", label: t.writingToneProfessional, desc: t.writingToneProfessionalDesc },
    { v: "concise",      label: t.writingToneConcise,      desc: t.writingToneConciseDesc      },
    { v: "casual",       label: t.writingToneCasual,       desc: t.writingToneCasualDesc       },
  ];

  const formats: { v: ConclusionFormat; label: string }[] = [
    { v: "paragraph", label: t.conclusionFormatParagraph },
    { v: "bullets",   label: t.conclusionFormatBullets   },
  ];

  const jpHardnesses: { v: JpHardness; label: string }[] = [
    { v: "soft",     label: t.jpHardnessSoft     },
    { v: "standard", label: t.jpHardnessStandard },
    { v: "formal",   label: t.jpHardnessFormal   },
  ];

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {t.writingStyleSection}
      </h3>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-hidden">

        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.writingToneLabel}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {tones.map(({ v, label, desc }) => (
              <OptionButton
                key={v}
                active={value.tone === v}
                onClick={() => patch({ tone: v })}
                label={label}
                desc={desc}
              />
            ))}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.conclusionFormatLabel}</p>
          <div className="flex gap-1.5">
            {formats.map(({ v, label }) => (
              <OptionButton
                key={v}
                active={value.conclusionFormat === v}
                onClick={() => patch({ conclusionFormat: v })}
                label={label}
              />
            ))}
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.jpHardnessLabel}</p>
          <div className="flex gap-1.5">
            {jpHardnesses.map(({ v, label }) => (
              <OptionButton
                key={v}
                active={value.jpHardness === v}
                onClick={() => patch({ jpHardness: v })}
                label={label}
              />
            ))}
          </div>
        </div>

      </div>

      <p className="mt-2.5 text-[11px] text-muted-foreground/50 leading-relaxed px-0.5">
        {locale === "ja"
          ? "表現設定は Free プランでも有効です。変更は即時反映されます。"
          : "Writing style applies on all plans. Changes are saved immediately."}
      </p>
    </section>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale }     = useLocale();
  const { plan }                     = usePlan();

  const defaultWritingStyle: WritingStyle = {
    tone: "natural", conclusionFormat: "paragraph", jpHardness: "soft",
  };

  const [writingStyle, setWritingStyle] = useState<WritingStyle>(
    settings.writingStyle ?? defaultWritingStyle
  );

  const isFree = plan === "free";

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/60">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 max-w-xl">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground leading-none">{t.settingsTitle}</h2>
            <p className="text-[11px] mt-0.5 text-muted-foreground/50">
              {isFree
                ? locale === "ja" ? "Free プラン" : "Free plan"
                : locale === "ja" ? "変更は即時反映されます" : "Changes are saved immediately"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-7 max-w-xl">
        <div className="space-y-8">

          {/* ══ ACCOUNT ══════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
              {locale === "ja" ? "アカウント" : "Account"}
            </h3>
            <div className="space-y-4">
              <FreePlanCard />
              <InviteCodeSection />
            </div>
          </section>

          {/* ══ DISPLAY ══════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
              {locale === "ja" ? "表示設定" : "Display"}
            </h3>
            <div className="space-y-4">

              {/* Language */}
              <div>
                <p className="text-[11px] font-semibold text-foreground mb-2">{t.uiLanguage}</p>
                <div className="flex gap-1.5">
                  {(["ja", "en"] as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`px-3.5 py-1.5 text-sm rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                        locale === l
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {l === "ja" ? "日本語" : "English"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground/50">
                  {locale === "ja"
                    ? "言語設定は即時反映（保存不要）"
                    : "Language applies immediately — no save needed"}
                </p>
              </div>

              {/* Writing Style */}
              <WritingStyleSection
                value={writingStyle}
                onChange={(ws) => {
                  setWritingStyle(ws);
                  updateSettings({ writingStyle: ws });
                }}
              />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
