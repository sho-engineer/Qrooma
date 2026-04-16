import { AGENTS } from "../data/dummy";
import { useLocale } from "../context/LocaleContext";

export default function EmptyState() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
      <div className="flex items-center gap-3 mb-8">
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: agent.color }}
            />
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold text-foreground mb-2">{t.emptyStateTitle}</p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        {t.emptyStateDesc}
      </p>
    </div>
  );
}
