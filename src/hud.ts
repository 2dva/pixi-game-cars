import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'

type HUDObject = {
  speed: Text
  odo: Text
}

const hudObj: HUDObject = {
  speed: new Text(),
  odo: new Text(),
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
    fontFamily: 'alarm clock, Arial', //"Segment7Standard",
    fontSize: 36,
    fill: '#ffffff', // белый цвет
    stroke: '#000000', // обводка
    // @ts-expect-error strokeThickness is valid but not in types
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
  })

  const textSpeed = new Text({
    text: '',
    style,
    x: 6,
    y: 10,
  })
  const textOdo = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: 'alarm clock, Arial',
      fontSize: 16,
      fill: '#ffffff', // белый цвет
      stroke: '#000000', // обводка
      dropShadow: true,
    }),
    x: 6,
    y: 70,
  })

  hudObj.speed = textSpeed
  hudObj.odo = textOdo
  updateHUD(startSpeed, 0)

  cont.addChild(textSpeed)
  cont.addChild(textOdo)

  app.stage.addChild(cont)
}

export function updateHUD(speed: number, distance: number) {
  hudObj.speed.text = `${Math.floor(speed)} kmh`
  hudObj.odo.text = `${(Math.floor(distance/100)/100).toFixed(2)} km`
}

export function calcDistance(speed: number) {
  return speed * 0.1
}
