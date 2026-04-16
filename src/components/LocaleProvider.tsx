'use client'

import { createContext, useContext } from 'react'
import { type Locale, type Translations, getT } from '@/lib/i18n'

const LocaleContext = createContext<Locale>('ja')

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

export function useT(): Translations {
  return getT(useLocale())
}
