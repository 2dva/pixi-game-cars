import { saveMyScore } from '../lib/topScore'
import { getScore } from '../state/selectors'
import type { TemplateData } from '../utils'
import { InputName, inputNameEvent } from './InputName/InputName'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

const DEFAULT_NAME = 'User'

export class ScreenNameInput extends Screen {
  screenId: ScreenMode = 'inputNameScreen'
  inputNameContainer: InputName | undefined

  onAfterSetup(): void {
    this.inputNameContainer?.activate()
  }

  setupData(): TemplateData {
    return { input: 'asdsad' }
  }

  customContent() {
    const domContainer = new InputName()
    this.inputNameContainer = domContainer
    domContainer.x = 140
    domContainer.y = 160
    domContainer.on(inputNameEvent, (name: string) => {
      const score = getScore()
      saveMyScore(name || DEFAULT_NAME, score)
      this.inputNameContainer?.destroy()
      this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, SCREEN_MODE.TOP_SCORE)
    })
    return domContainer
  }

  onUserAction(keyCode: string) {
    if (keyCode === 'Enter') {
      // console.log(`VALUE=`, this.input.value);
      //this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.FREE_RIDE)
    }
  }
}
