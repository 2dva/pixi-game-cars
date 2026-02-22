import { BitmapText, Container, Graphics } from 'pixi.js'
import { APP_WIDTH } from '../configuration'
import { calculateGear, formatDistance } from '../utils'

const POS_X = APP_WIDTH - 200
const POS_Y = 20

const FONT_STYLE = {
  speedBg: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#565656',
    stroke: '#000000',
  },
  speed: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ccffcc',
    stroke: { color: '#000000', width: 2 },
  },
  odo: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 16,
    fill: '#ffffff',
    stroke: '#000000',
  },
  gear: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 38,
    fill: '#a9a9a9',
  },
}

export class Gauges extends Container {
  private speed!: BitmapText
  private gear!: BitmapText
  private odo!: BitmapText

  constructor() {
    super()
  }

  async preloadAssets() {}

  setup(parent: Container) {
    this.position.set(POS_X, POS_Y)

    const background = new Graphics()
    background.roundRect(0, 0, 180, 100, 10).fill({
      color: 0x000000,
      alpha: 0.4,
    })
    background.roundRect(138, 51, 34, 40, 4).fill({
      color: 0x000000,
      alpha: 0.4,
    })
    this.addChild(background)

    const textSpeedBG = new BitmapText({
      text: '888 kmh',
      style: FONT_STYLE.speedBg,
      x: 170,
      y: 10,
    })
    textSpeedBG.anchor.set(1, 0)

    const textSpeed = new BitmapText({
      text: '',
      style: FONT_STYLE.speed,
      x: 170,
      y: 10,
    })
    textSpeed.anchor.set(1, 0)

    const textOdo = new BitmapText({
      text: '',
      style: FONT_STYLE.odo,
      x: 22,
      y: 72,
    })

    const textGear = new BitmapText({
      text: 'P',
      style: FONT_STYLE.gear,
      x: 145,
      y: 55,
    })

    this.addChild(textSpeedBG)
    this.addChild(textSpeed)
    this.addChild(textGear)
    this.addChild(textOdo)

    this.speed = textSpeed
    this.gear = textGear
    this.odo = textOdo
    parent.addChild(this)
  }

  draw(speed: number, distance: number) {
    this.speed.text = `${Math.floor(speed)} kmh`
    this.gear.text = calculateGear(speed)
    this.odo.text = `${formatDistance(distance, 7)} km`
  }
}
