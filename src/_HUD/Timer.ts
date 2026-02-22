import { Container, Text } from 'pixi.js'
import { APP_WIDTH } from '../configuration'

const POS_X = APP_WIDTH / 2
const POS_Y = 50

const FONT_STYLE = {
  score: {
    fontFamily: 'Arial',
    fontSize: 64,
    fill: '#ffffff',
    stroke: { color: '#000000', width: 4 },
    dropShadow: true, // Enable the drop shadow
    dropShadowColor: '#000000', // Shadow color (red)
    dropShadowAngle: Math.PI / 4, // 30 degrees angle
    dropShadowBlur: 4, // Shadow blur radius
    dropShadowDistance: 6, // Shadow distance
  },
}

const TINT_DEFAULT = 0xf5f5f5
const TINT_BRIGHT = 0xfb8e8e

export class Timer extends Container {
  private textObj!: Text

  constructor() {
    super()
  }

  setup(parent: Container) {
    this.position.set(POS_X, POS_Y)

    this.textObj = new Text({
      text: '60',
      style: FONT_STYLE.score,
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
