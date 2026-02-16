import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import { APP_WIDTH } from './configuration'

type HUDObject = {
  speed: Text
  odo: Text
  score: Text
}

const hudObj: HUDObject = {
  speed: new Text(),
  odo: new Text(),
  score: new Text(),
}

export function addScore(app: Application) {
  const cont = new Container()
  cont.position.set(20, 20)
  const background = new Graphics()
  background.roundRect(0, 0, 180, 40, 10).fill({
    color: 0x000000,
    alpha: 0.4,
  })
  const scoreStyle = {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ffffff',
    stroke: '#000000',
  }
  const textScore = new Text({
    text: '0',
    style: new TextStyle(scoreStyle),
    x: 170,
    y: 4,
  })
  textScore.anchor.set(1, 0)
  cont.addChild(background)
  cont.addChild(textScore)

  hudObj.score = textScore
  app.stage.addChild(cont)
}

export function updateScore(score: number) {
  hudObj.score.text = `${score}`
}

export function addHUD(app: Application, startSpeed: number) {
  const cont = new Container()
  cont.position.set(APP_WIDTH - 200, 20)

  const background = new Graphics()
  background.roundRect(0, 0, 180, 100, 10).fill({
    color: 0x000000,
    alpha: 0.4,
  })

  cont.addChild(background)

  const speedStyleBG = {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#565656',
    stroke: '#000000',
  }
  const speedStyle = {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
  }

  const textSpeedBG = new Text({
    text: '888 kmh',
    style: new TextStyle(speedStyleBG),
    x: 170,
    y: 10,
  })
  textSpeedBG.anchor.set(1, 0)
  const textSpeed = new Text({
    text: '',
    style: new TextStyle(speedStyle),
    x: 170,
    y: 10,
  })
  textSpeed.anchor.set(1, 0)
  const textOdo = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: 'alarm clock, Arial',
      fontSize: 16,
      fill: '#ffffff',
      stroke: '#000000',
      dropShadow: true,
    }),
    x: 22,
    y: 72,
  })

  cont.addChild(textSpeedBG)
  cont.addChild(textSpeed)
  cont.addChild(textOdo)

  hudObj.speed = textSpeed
  hudObj.odo = textOdo
  updateHUD(startSpeed, 0)
  app.stage.addChild(cont)
}

export function updateHUD(speed: number, distance: number) {
  hudObj.speed.text = `${('' + Math.floor(speed))} kmh`
  hudObj.odo.text = `${'' + (Math.floor(distance / 100) / 100).toFixed(1).padStart(7, '0')} km`
}

export function calcDistance(speed: number) {
  return speed * 0.1
}
