import { Application, Container, Graphics } from 'pixi.js'

const scaleHeight = 148
let scale: Graphics

export function addCondition(app: Application) {
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

  scale = scaleElement

  app.stage.addChild(cont)
}

export function updateCondition(condition: number) {
  scale.clear()
  scale.moveTo(15, 155)
  scale.lineTo(15, 155 - Math.round((scaleHeight / 100) * condition))
  scale.stroke({ width: 20, color: 0x00ff00, alpha: 0.6 })
}
