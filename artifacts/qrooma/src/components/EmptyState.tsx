import { AGENTS } from "../data/dummy";
import { useLocale } from "../context/LocaleContext";

export default function EmptyState() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center px-6">
      <div className="flex items-center gap-2 mb-6">
        {AGENTS.map((agent, i) => (
          <div key={agent.id} className="flex flex-col items-center gap-1.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: agent.color, animationDelay: `${i * 150}ms` }}
            >
              {agent.initial}
            </div>
            <span className="text-[10px] text-muted-foreground">{agent.name}</span>
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
