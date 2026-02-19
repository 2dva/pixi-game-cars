import { Application, Assets, Sprite } from 'pixi.js'
import { APP_HEIGHT } from '../configuration'

export class Logo {
  constructor() {}

  async preloadAssets() {
    await Assets.load({ alias: 'logo', src: 'logo.png' })
  }

  setup(app: Application) {
    const logo = Sprite.from('logo')
    logo.x = 12
    logo.y = APP_HEIGHT - 50
    logo.width = 200
    logo.scale.y = logo.scale.x
    logo.alpha = 0.55
    app.stage.addChild(logo)
  }

  draw() {}
}
