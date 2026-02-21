import { Assets, Container } from 'pixi.js'
import type { State } from '../state'
import { throttle } from '../utils'
import { Gauges } from './Gauges'
import { Health } from './Health'
import { Logo } from './Logo'
import { Score } from './Score'

export class HUD {
  private gauges: Gauges
  private score: Score
  private logo: Logo
  private health: Health
  draw = throttle(this.instantDraw, 200)

  constructor() {
    this.gauges = new Gauges()
    this.score = new Score()
    this.logo = new Logo()
    this.health = new Health()
  }

  async preloadAssets() {
    await Assets.load('fonts/alarm_clock.ttf')
    await this.logo.preloadAssets()
  }

  setup(stage: Container) {
    this.gauges.setup(stage)
    this.score.setup(stage)
    this.logo.setup(stage)
    this.health.setup(stage)
  }

  private instantDraw(state: State) {
    const { speed, distance, score, health } = state
    this.gauges.draw(speed, distance)
    this.health.draw(health)
    this.score.draw(score)
  }
}
