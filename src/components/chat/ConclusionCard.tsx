import type { ConclusionCard as ConclusionCardType } from '@/types/database'

interface Props {
  conclusion: ConclusionCardType
  mode: string
}

export function ConclusionCard({ conclusion, mode }: Props) {
  const modeLabel = mode === 'structured_debate' ? 'Structured Debate' : 'Free Talk'

  return (
    <div className="mx-4 my-6 border border-purple-200 rounded-xl overflow-hidden bg-gradient-to-b from-purple-50 to-white shadow-sm">
      <div className="px-5 py-3 bg-purple-600 text-white">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm">Conclusion</span>
          <span className="text-xs text-purple-200">{modeLabel}</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Main conclusion */}
        <div>
          <p className="text-gray-900 font-medium leading-relaxed">{conclusion.conclusion}</p>
        </div>

        {/* Rationale */}
        {conclusion.rationale && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Rationale
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{conclusion.rationale}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Risks */}
          {conclusion.risks?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                Risks
              </h4>
              <ul className="space-y-1">
                {conclusion.risks.map((risk, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next actions */}
          {conclusion.next_actions?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                Next Actions
              </h4>
              <ul className="space-y-1">
                {conclusion.next_actions.map((action, i) => (
                  <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Disagreements */}
        {conclusion.disagreements?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">
              Disagreements
            </h4>
            <ul className="space-y-1">
              {conclusion.disagreements.map((d, i) => (
                <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                  <span className="text-orange-400 mt-0.5 flex-shrink-0">≠</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unknowns */}
        {conclusion.unknowns?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Unknowns
            </h4>
            <ul className="space-y-1">
              {conclusion.unknowns.map((u, i) => (
                <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">?</span>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
