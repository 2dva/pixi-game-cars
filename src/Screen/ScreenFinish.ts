import { isRecordScore } from '../lib/topScore'
import { getDistance, getScore } from '../state/selectors'
import { GAME_MODE } from '../types'
import { formatDistance, type TemplateData } from '../utils'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

export class ScreenFinish extends Screen {
  screenId: ScreenMode = 'endScreenTimeIsUp'

  onUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }

  setupData(): TemplateData {
    const score = getScore()
    const record = isRecordScore(score)
    const distance = formatDistance(getDistance())
    return { score, distance, record }
  }

  onAfterSetup() {
    const score = getScore()
    if (score > 0) {
      const screen = isRecordScore(score) ? SCREEN_MODE.INPUT_NAME : SCREEN_MODE.TOP_SCORE
      this.timer = setTimeout(() => {
        this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, screen)
      }, 2000)
    }
  }
}
