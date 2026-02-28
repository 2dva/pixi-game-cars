import { Assets, Container, Sprite } from 'pixi.js'
import { gameConfig } from '../configuration'

export class Logo extends Container {
  constructor() {
    super()
  }

  async preloadAssets() {
    await Assets.load({ alias: 'logo', src: 'hud/logo.png' })
  }

  setup(parent: Container) {
    const POS_X = 12
    const POS_Y = gameConfig.appHeight - 50

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
