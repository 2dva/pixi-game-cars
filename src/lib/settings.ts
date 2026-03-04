/**
 * Модуль для сохранения и получения настроек
 */
const storageKey = 'clines_settings'

type SettingName = 'soundOn'
type SettingValue = string | boolean | number

export const Settings = {
  load: function (name: SettingName): SettingValue | undefined {
    const allSettings = JSON.parse(localStorage[storageKey] || '{}')
    return allSettings[name]
  },
  save: function (name: SettingName, value: SettingValue) {
    const allSettings = JSON.parse(localStorage[storageKey] || '{}')
    allSettings[name] = value
    localStorage[storageKey] = JSON.stringify(allSettings)
  },
}
