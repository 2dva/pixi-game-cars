import { getTopScore } from '../lib/topScore'
import { GAME_MODE, type State } from '../state'
import type { TemplateData } from '../utils'
import { EVENT_TYPE, Screen, type ScreenMode } from './Screen'

const DEFAULT_NAME = 'User'

export class ScreenTopScore extends Screen {
  screenId: ScreenMode = 'endScreenTopScore'

  doUserAction(keyCode: string) {
    if (keyCode === 'Space') {
      this.fire(EVENT_TYPE.SELECT_GAME_MODE, GAME_MODE.DEMO)
    }
  }

  private buildTopScoreTable(name: string, score: number = 0) {
    const data = getTopScore()
    let results = '',
      highlightOnce = false
    for (let i = 0; i < Math.min(6, data.length); i++) {
      const [n, s] = data[i]
      let row = String(n).padEnd(6) + '   ' + String(s).padStart(6, '0') + '\n'
      if (n === name && s === score && !highlightOnce) {
        highlightOnce = true
        row = `<b>${row}</b>`
      }
      results += row
    }

    return results
  }

  setupData(state: State): TemplateData {
    return { topScore: this.buildTopScoreTable(DEFAULT_NAME, state.score) }
  }
}
