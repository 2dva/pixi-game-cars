import { Container, Text } from 'pixi.js'
import { gameConfig } from '../configuration'
import fontStyles from '../fontStyles.json'

const TINT_DEFAULT = 0xf5f5f5
const TINT_BRIGHT = 0xfb8e8e

export class Timer extends Container {
  private textObj!: Text

  constructor() {
    super()
  }

  setup(parent: Container) {
    const POS_X = gameConfig.appWidth / 2
    const POS_Y = 50

    this.position.set(POS_X, POS_Y)

    this.textObj = new Text({
      text: '60',
      style: fontStyles.fontHUDTimer,
      x: 0,
      y: 0,
    })
    this.textObj.tint = TINT_DEFAULT
    this.textObj.anchor.set(0.5)

    this.addChild(this.textObj)
    parent.addChild(this)
  }

  draw(timeLeft: number) {
    timeLeft = Math.round(timeLeft)
    if (String(timeLeft) != this.textObj.text) {
      this.textObj.text = `${timeLeft}`
      this.textObj.tint = timeLeft < 10 ? TINT_BRIGHT : TINT_DEFAULT
    }
  }
}
