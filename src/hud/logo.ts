import { Application, Assets, Sprite } from 'pixi.js'
import { APP_HEIGHT } from '../configuration'

export async function preloadLogoAssets() {
  await Assets.load('logo.png')
}

export function addLogo(app: Application) {
    const logo = Sprite.from('logo.png')
    logo.x = 12
    logo.y = APP_HEIGHT - 50
    logo.width = 200
    logo.scale.y = logo.scale.x
    logo.alpha = 0.55
    app.stage.addChild(logo)
}