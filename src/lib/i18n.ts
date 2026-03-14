import { I18n } from 'i18n-js'
import { SETTING_NAME, Settings } from './settings'
import { gameConfig } from '../configuration'

const i18n = new I18n(undefined, { locale: 'ru' })
let keySuffix = ''

export const setupLanguageOptions = () => {
  keySuffix = gameConfig.isMobileDevice ? '_mobile' : ''

  // сначала пробуем взять настройку из стораджа
  let locale = Settings.load(SETTING_NAME.LOCALE) as string
  if (locale === undefined) {
    // затем значение по-умолчанию
    locale = navigator.language.startsWith('en') ? 'en' : 'ru'
  }
  if (i18n.locale !== locale) {
    i18n.locale = locale
    loadTranslations(locale)
  }
}

export const getCurrentLocale = () => {
  return i18n.locale
}

export async function loadTranslations(locale: string = i18n.locale) {
  const translations = await import(`../translations/${locale}.json`)
  i18n.store(translations)
}

export function tr(stringOrKey: string) {
  return i18n.get(stringOrKey + keySuffix) || i18n.get(stringOrKey) || stringOrKey
}
