import { BitmapText, Container, Graphics } from 'pixi.js'
import { gameConfig } from '../configuration'
import fontStyles from '../fontStyles.json'
import { calculateGear } from '../physics'
import { formatDistance } from '../utils'

export class Gauges extends Container {
  private speed!: BitmapText
  private gear!: BitmapText
  private odo!: BitmapText

  constructor() {
    super()
  }

  async preloadAssets() {}

  setup(parent: Container) {
    const POS_X = gameConfig.appWidth - 200
    const POS_Y = 20

    this.position.set(POS_X, POS_Y)

    const background = new Graphics()
    background
      .roundRect(0, 0, 180, 100, 10)
      .fill({
        color: 0x000000,
        alpha: 0.4,
      })
      .roundRect(138, 51, 34, 40, 4)
      .fill({
        color: 0x000000,
        alpha: 0.4,
      })
    this.addChild(background)

    const textSpeedBG = new BitmapText({
      text: '888 kmh',
      style: fontStyles.fontGaugesSpeedBg,
      x: 170,
      y: 10,
    })
    textSpeedBG.anchor.set(1, 0)

    const textSpeed = new BitmapText({
      text: '',
      style: fontStyles.fontGaugesSpeed,
      x: 170,
      y: 10,
    })
    textSpeed.anchor.set(1, 0)

    const textOdo = new BitmapText({
      text: '',
      style: fontStyles.fontGaugesOdometer,
      x: 22,
      y: 72,
    })

    const textGear = new BitmapText({
      text: 'P',
      style: fontStyles.fontGaugesGear,
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
