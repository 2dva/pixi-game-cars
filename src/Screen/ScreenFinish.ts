import { isRecordScore, saveMyScore } from '../lib/topScore'
import { type StateHero } from '../state/state'
import { GAME_MODE } from '../types'
import { formatDistance, type TemplateData } from '../utils'
import { EVENT_TYPE, Screen, SCREEN_MODE, type ScreenMode } from './Screen'

const DEFAULT_NAME = 'User'

export class ScreenFinish extends Screen {
  screenId: ScreenMode = 'endScreenTimeIsUp'

  onUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }

  setupData(state: StateHero): TemplateData {
    const record = isRecordScore(state.score)
    if (record) {
      saveMyScore(DEFAULT_NAME, state.score)
    }
    return { score: state.score, distance: formatDistance(state.distance), record }
  }

  onAfterSetup(state: StateHero) {
    if (state.score > 0) {
      this.timer = setTimeout(() => {
        this.fire(EVENT_TYPE.GO_TO_SCREEN, undefined, SCREEN_MODE.TOP_SCORE)
      }, 2000)
    }
  }
}
