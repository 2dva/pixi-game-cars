import { Assets, Color, Container, FillGradient, Graphics, Sprite } from 'pixi.js'

const POS_X = 15
const POS_Y = 310
const SCALE_HEIGHT = 155

const colorStops = [
  { offset: 0, color: '#646464' },
  { offset: 0.5, color: '#ffffff' },
  { offset: 1, color: '#0a0a0a' },
]

type ColorPair = [number, number]

export class Fuel extends Container {
  private gradientColorMap: number[][]
  private scaleGradient: FillGradient
  private scaleObj!: Graphics
  private health = 0

  constructor() {
    super()
    this.scaleGradient = new FillGradient({
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
      colorStops: colorStops,
      textureSpace: 'local',
    })
    this.gradientColorMap = this.createColorMap([0x01c929, 0xff0000])
  }

  async preloadAssets() {
    await Assets.load({ alias: 'gas', src: 'gas.png' })
  }

  setup(parent: Container) {
    this.visible = false
    this.position.set(POS_X, POS_Y)

    const icon = Sprite.from('gas')
    icon.width = 30
    icon.scale.y = icon.scale.x
    icon.alpha = 0.4
    icon.x = 0
    icon.y = -30

    this.addChild(icon)

    const scaleElement = new Graphics()
    const background = new Graphics()
    background.roundRect(0, 0, 30, 160, 1).fill({
      color: 0x000000,
      alpha: 0.4,
    })

    this.scaleObj = scaleElement

    this.addChild(background)
    this.addChild(scaleElement)
    parent.addChild(this)
  }

  draw(health: number) {
    if (this.health !== health) {
      this.health = Math.min(health, 100)
      this.scaleObj.clear()
      this.scaleObj.moveTo(15, 155)
      this.scaleObj.lineTo(15, 155 - Math.round((SCALE_HEIGHT / 100) * this.health))
      this.scaleObj.stroke({ width: 20, alpha: 0.9, fill: this.scaleGradient })
      this.scaleObj.tint = this.calcTint
    }
  }

  private createColorMap(colors: ColorPair): number[][] {
    return [new Color(colors[1]).toArray(), new Color(colors[0]).toArray()]
  }

  private get calcTint(): number {
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
