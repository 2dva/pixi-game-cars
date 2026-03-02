import { I18n } from 'i18n-js'

const locale = navigator.language.startsWith('en') ? 'en' : 'ru'
const i18n = new I18n(undefined, { locale })
let keySuffix = ''

export function setMobileVersion(isMobile: boolean) {
  keySuffix = isMobile ? '_mobile' : ''
}

export async function loadTranslations(locale: string = i18n.locale) {
  const translations = await import(`./translations/${locale}.json`)
  i18n.store(translations)
}

export function tr(stringOrKey: string) {
  return i18n.get(stringOrKey + keySuffix) || i18n.get(stringOrKey) || stringOrKey
}
