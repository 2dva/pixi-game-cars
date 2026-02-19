import { Application, Container, Graphics } from 'pixi.js'

const SCALE_HEIGHT = 148

export class Health {
  private scale!: Graphics

  constructor() {}

  async preloadAssets() {}

  setup(app: Application) {
    const cont = new Container()
    cont.position.set(10, 120)
    const background = new Graphics()
    background.roundRect(0, 0, 30, 160, 5).fill({
      color: 0x000000,
      alpha: 0.4,
    })
    const scaleElement = new Graphics()

    cont.addChild(background)
    cont.addChild(scaleElement)

    this.scale = scaleElement

    app.stage.addChild(cont)
  }

  draw(health: number) {
    this.scale.clear()
    this.scale.moveTo(15, 155)
    this.scale.lineTo(15, 155 - Math.round((SCALE_HEIGHT / 100) * health))
    this.scale.stroke({ width: 20, color: 0x00ff00, alpha: 0.6 })
  }
}
