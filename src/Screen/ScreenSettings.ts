import { CheckBox, RadioGroup } from '@pixi/ui'
import { Container } from 'pixi.js'
import { GAME_MODE } from '../types'
import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'
import { SETTING_NAME, Settings } from '../lib/settings'
import { getCurrentLocale, setupLanguageOptions } from '../lib/i18n'

const LANGS = ['ru', 'en']

export class ScreenSettings extends Screen {
  screenId: ScreenMode = 'settingsScreen'
  cont: Container | null = null

  customContent() {
    this.cont = new Container()
    this.cont.x = 80
    this.cont.y = 120

    const select = new RadioGroup({
      items: [
        new CheckBox({
          text: 'Русский',
          style: {
            unchecked: `switch_off`,
            checked: `switch_on`,
            text: {
              fill: 0xffffff,
            },
          },
        }),
        new CheckBox({
          text: 'English',
          style: {
            unchecked: `switch_off`,
            checked: `switch_on`,
            text: {
              fill: 0xffffff,
            },
          },
        }),
      ],
      selectedItem: LANGS.indexOf(getCurrentLocale()),
      type: 'horizontal',
      elementsMargin: 20,
    })
    select.onChange.connect((selectedId: number) => {
      Settings.save(SETTING_NAME.LOCALE, LANGS[selectedId])
      setupLanguageOptions()
    })
    this.cont.addChild(select)
    return this.cont
  }

  onUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }
}
