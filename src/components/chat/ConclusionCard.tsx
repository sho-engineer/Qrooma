'use client'

import { useState } from 'react'
import { useT } from '@/components/LocaleProvider'
import type { ConclusionCard as ConclusionCardType } from '@/types/database'

interface Props {
  conclusion: ConclusionCardType
  mode: string
  defaultOpen?: boolean
}

export function ConclusionCard({ conclusion, mode, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const t = useT()
  const modeLabel = mode === 'structured_debate' ? t.structuredDebate : t.freeTalk

  return (
    <div className="mx-4 my-4 border border-purple-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-3 bg-purple-600 text-white flex items-center justify-between hover:bg-purple-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{t.conclusion}</span>
          <span className="text-xs text-purple-200 hidden sm:inline">— {modeLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {!open && (
            <p className="text-xs text-purple-200 max-w-xs truncate text-left">
              {conclusion.conclusion}
            </p>
          )}
          <span className="text-purple-200 text-xs select-none">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Collapsible body */}
      {open && (
        <div className="px-5 py-4 space-y-4 bg-gradient-to-b from-purple-50 to-white">
          {/* Main conclusion */}
          <div>
            <p className="text-gray-900 font-medium leading-relaxed">{conclusion.conclusion}</p>
          </div>

          {/* Rationale */}
          {conclusion.rationale && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t.rationale}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{conclusion.rationale}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Risks */}
            {conclusion.risks?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                  {t.risks}
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
                  {t.nextActions}
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
                {t.disagreements}
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
                {t.unknowns}
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
      )}
    </div>
  )
}
