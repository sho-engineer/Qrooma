import { useLocale } from "../context/LocaleContext";

const EXAMPLES_JA = [
  "MVPに入れる機能を決めたい",
  "LPの訴求を比較したい",
  "価格プランを整理したい",
  "実装方針を決めたい",
];

const EXAMPLES_EN = [
  "Decide what goes into the MVP",
  "Compare landing page angles",
  "Figure out our pricing structure",
  "Choose an implementation approach",
];

export default function EmptyState() {
  const { t, locale } = useLocale();
  const examples = locale === "ja" ? EXAMPLES_JA : EXAMPLES_EN;

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center px-6">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-5">
        <span className="text-lg text-muted-foreground/40">·</span>
      </div>

      <p className="text-sm font-semibold text-foreground mb-2">{t.emptyStateTitle}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mb-6">
        {t.emptyStateDesc}
      </p>

      <div className="flex flex-col gap-1.5 w-full max-w-xs">
        {examples.map((ex) => (
          <div
            key={ex}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-left"
          >
            <span className="text-muted-foreground/40 text-xs flex-shrink-0">例</span>
            <span className="text-xs text-muted-foreground leading-relaxed">{ex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
