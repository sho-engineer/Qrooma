'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { markOnboardingSeen } from '@/actions/auth'
import { useT } from '@/components/LocaleProvider'

export function OnboardingModal() {
  const t = useT()
  const router = useRouter()
  const [dismissing, setDismissing] = useState(false)

  async function handleDismiss(goToSettings: boolean) {
    setDismissing(true)
    await markOnboardingSeen()
    if (goToSettings) {
      router.push('/settings')
    } else {
      router.refresh()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 mx-auto">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">
          {t.onboardingTitle}
        </h2>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {t.onboardingBody}
        </p>

        <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mb-6">
          <svg
            className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">{t.onboardingNote}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleDismiss(true)}
            disabled={dismissing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {t.onboardingCta}
          </button>
          <button
            onClick={() => handleDismiss(false)}
            disabled={dismissing}
            className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {t.onboardingLater}
          </button>
        </div>
      </div>
    </div>
  )
}
