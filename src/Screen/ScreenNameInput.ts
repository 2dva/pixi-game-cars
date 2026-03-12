import { SETTING_NAME, Settings } from '../lib/settings'
import { saveMyScore } from '../lib/topScore'
import { getScore } from '../state/selectors'
import { InputName, inputNameEvent } from './InputName/InputName'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

const DEFAULT_NAME = 'User'

export class ScreenNameInput extends Screen {
  screenId: ScreenMode = 'inputNameScreen'
  inputNameContainer: InputName | undefined

  onAfterSetup(): void {
    const name = Settings.load(SETTING_NAME.PLAYER_NAME) || ''
    this.inputNameContainer?.activate(name as string)
  }

  customContent() {
    const domContainer = new InputName()
    this.inputNameContainer = domContainer
    domContainer.anchor = 0.5
    domContainer.x = this.contentWidth / 2
    domContainer.y = 180
    domContainer.on(inputNameEvent, (name: string) => {
      if (name !== '') Settings.save(SETTING_NAME.PLAYER_NAME, name)
      const score = getScore()
      saveMyScore(name || DEFAULT_NAME, score)
      this.inputNameContainer?.destroy()
      this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, SCREEN_MODE.TOP_SCORE)
    })
    return domContainer
  }
}
