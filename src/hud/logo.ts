import { Assets, Container, Sprite } from 'pixi.js'
import { APP_HEIGHT } from '../configuration'

const POS_X = 12
const POS_Y = APP_HEIGHT - 50

export class Logo extends Container {
  constructor() {
    super()
  }

  async preloadAssets() {
    await Assets.load({ alias: 'logo', src: 'logo.png' })
  }

  setup(parent: Container) {
    this.position.set(POS_X, POS_Y)

    const logo = Sprite.from('logo')
    logo.width = 200
    logo.scale.y = logo.scale.x
    logo.alpha = 0.55

    this.addChild(logo)
    parent.addChild(this)
  }

  draw() {}
}
