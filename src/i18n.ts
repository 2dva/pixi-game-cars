import { I18n } from 'i18n-js'

const locale = navigator.language.startsWith('en') ? 'en' : 'ru'

export const i18n = new I18n(undefined, { locale })

export async function loadTranslations(locale: string = i18n.locale) {
  const translations = await import(`./translations/${locale}.json`)
  i18n.store(translations)
}

export function tr(stringOrKey: string) {
  return i18n.get(stringOrKey) || stringOrKey
}
