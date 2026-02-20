import { Application, Color, Container, FillGradient, Graphics } from 'pixi.js'

const SCALE_HEIGHT = 148
const colorStops = [
  { offset: 0, color: '#646464' },
  { offset: 0.5, color: '#ffffff' },
  { offset: 1, color: '#0a0a0a' },
]
type ColorPair = [number, number]

export class Health {
  private scale!: Graphics
  private scaleGradient: FillGradient
  private health = 0
  private gradientColorMap: number[][]

  constructor() {
    this.scaleGradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      colorStops: colorStops,
      textureSpace: 'local',
    })
    this.gradientColorMap = this.createColorMap([0x00ff00, 0xff0000])
  }

  async preloadAssets() {}

  setup(app: Application) {
    const cont = new Container()
    cont.position.set(10, 90)

    const scaleElement = new Graphics()
    const background = new Graphics()
    background.roundRect(0, 0, 30, 160, 5).fill({
      color: 0x000000,
      alpha: 0.4,
    })

    this.scale = scaleElement

    cont.addChild(background)
    cont.addChild(scaleElement)
    app.stage.addChild(cont)
  }

  draw(health: number) {
    if (this.health !== health) {
      this.health = health
      this.scale.clear()
      this.scale.moveTo(15, 155)
      this.scale.lineTo(15, 155 - Math.round((SCALE_HEIGHT / 100) * health))
      this.scale.stroke({ width: 20, color: 0x00ff00, alpha: 0.7, fill: this.scaleGradient })
      this.scale.tint = this.tint
    }
  }

  private createColorMap(colors: ColorPair): number[][] {
    return [new Color(colors[1]).toArray(), new Color(colors[0]).toArray()]
  }

  private get tint(): number {
    // Linearly interpolate each component
    const [[r1, g1, b1, a1], [r2, g2, b2, a2]] = this.gradientColorMap
    const amount = this.health / 100
    const r = r1 + (r2 - r1) * amount
    const g = g1 + (g2 - g1) * amount
    const b = b1 + (b2 - b1) * amount
    const a = a1 + (a2 - a1) * amount

    // Convert the resulting RGBA (0-1) components back to a PixiJS hex integer color
    return Color.shared.setValue({ r: r * 255, g: g * 255, b: b * 255, a }).toNumber()
  }
}
