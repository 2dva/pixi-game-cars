import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'

type HUDObject = {
  speed: Text
}

const hudObj: HUDObject = {
  speed: new Text(),
}

export function addHUD(app: Application, startSpeed: number) {
  const cont = new Container()
  cont.position.set(app.screen.width - 200, 20)

  const background = new Graphics()
  background.roundRect(0, 0, 180, 100, 10).fill({
    color: 0x000000,
    alpha: 0.4,
  })

  // This ensures other children are drawn on top of it
  cont.addChild(background)

  const style = new TextStyle({
    fontFamily: 'alarm clock, Arial',
    // fontFamily: "Segment7Standard, Arial",
    fontSize: 36,
    fill: '#ffffff', // белый цвет
    stroke: '#000000', // обводка
    // @ts-expect-error strokeThickness is valid but not in types
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
  })

  const text = new Text({
    text: '',
    style,
    x: 6,
    y: 10,
  })

  hudObj.speed = text
  updateHUD(startSpeed)

  cont.addChild(text)

  app.stage.addChild(cont)
}

export function updateHUD(speed: number) {
  hudObj.speed.text = `${speed} kmh`
}
