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
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
        </div>

        {/* Title — warm welcome */}
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-1">
          {t.onboardingTitle}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-4">
          {t.onboardingWelcome}
        </p>

        {/* BYOK explanation */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {t.onboardingBody}
        </p>

        {/* Security note */}
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
