import { Assets, Container } from 'pixi.js'
import { getHero, getMode } from '../state/selectors'
import type { IMajorGameContainer } from '../types'
import { GAME_MODE } from '../types'
import { throttle } from '../utils'
import { Fuel } from './Fuel'
import { Gauges } from './Gauges'
import { Health } from './Health'
import { Logo } from './Logo'
import { Score } from './Score'
import { SoundSwitch } from './SoundSwitch'
import { Timer } from './Timer'

export class HUD extends Container implements IMajorGameContainer {
  private gauges: Gauges
  private score: Score
  private logo: Logo
  private soundSwitch: SoundSwitch
  private health: Health
  private fuel: Fuel
  private timer: Timer
  draw = throttle(this.instantDraw, 200)

  constructor() {
    super()
    this.gauges = new Gauges()
    this.score = new Score()
    this.logo = new Logo()
    this.soundSwitch = new SoundSwitch()
    this.health = new Health()
    this.fuel = new Fuel()
    this.timer = new Timer()
  }

  async preloadAssets() {
    await Assets.load('fonts/alarm_clock.ttf')
    await this.health.preloadAssets()
    await this.fuel.preloadAssets()
    await this.logo.preloadAssets()
    await this.soundSwitch.preloadAssets()
  }

  setup(stage: Container) {
    this.gauges.setup(stage)
    this.score.setup(stage)
    this.logo.setup(stage)
    this.soundSwitch.setup(stage)
    this.health.setup(stage)
    this.fuel.setup(stage)
    this.timer.setup(stage)
  }

  reset() {}

  private instantDraw() {
    const { speed, distance, score, health, timeLeft } = getHero()
    this.gauges.draw(speed, distance)
    this.health.draw(health)
    this.score.draw(score)
    this.timer.visible = getMode() === GAME_MODE.COLLECT_IN_TIME
    this.timer.draw(timeLeft)
  }
}
