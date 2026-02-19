import { Graphics, Ticker, type Container } from 'pixi.js'

const BASE_X = 40
const BASE_Y = 120

export class Exhaust {
  groups: Graphics[] = []
  smokePos: number[] = []

  constructor() {}

  async preloadAssets() {}

  setup(container: Container) {
    const groupCount = 3
    const particleCount = 4

    for (let i = 0; i < groupCount; i++) {
      const smokeGroup = new Graphics()

      for (let i = 0; i < particleCount; i++) {
        const radius = 20 + Math.random() * 8
        const x = (Math.random() * 2 - 1) * 10
        const y = (Math.random() * 2 - 1) * 10

        smokeGroup.circle(x, y, radius)
      }

      smokeGroup.fill({ color: 0xc9c9c9, alpha: 0.5 })

      smokeGroup.x = BASE_X
      smokeGroup.y = BASE_Y
      this.smokePos[i] = i * (1 / groupCount)
      this.groups.push(smokeGroup)
      container.addChild(smokeGroup)
    }
  }

  draw(speed: number, deltaSpeed: number, time: Ticker) {
    const dt = time.deltaTime * 0.02
    const visible = deltaSpeed > 0

    this.groups.forEach((group, i) => {
      group.visible = speed > 0
      group.alpha = visible ? 0.5 : 0.06
      this.smokePos[i] = (this.smokePos[i] + dt) % 1
      group.x = BASE_X - Math.pow(this.smokePos[i], 2) * 4
      group.y = BASE_Y + this.smokePos[i] * 80
      group.scale.set(Math.pow(this.smokePos[i], 0.75))
    })
  }
}
