import { Application, Assets, Container, Graphics, Text, TextStyle } from 'pixi.js'
import { APP_WIDTH } from '../configuration'
import { calculateGear } from '../utils'
import { addLogo, preloadLogoAssets } from './logo'
import { addScore, updateScore } from './score'

type HUDObject = {
  speed: Text
  gear: Text
  odo: Text
}

const hudObj: HUDObject = {
  speed: new Text(),
  gear: new Text(),
  odo: new Text(),
}

const FONT_STYLE = {
  speedBg: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#565656',
    stroke: '#000000',
  },
  speed: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ccffcc',
    stroke: { color: '#000000', width: 2 },
  },
  odo: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 16,
    fill: '#ffffff',
    stroke: '#000000',
  },
  gear: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 38,
    fill: '#a9a9a9',
  },
}

export async function preloadHudAssets() {
  await preloadLogoAssets()
  await Assets.load('fonts/Segment7Standard.otf')
  await Assets.load('fonts/alarm_clock.ttf')
}

export function addHUD(app: Application, startSpeed: number) {
  const cont = new Container()
  cont.position.set(APP_WIDTH - 200, 20)

  const background = new Graphics()
  background.roundRect(0, 0, 180, 100, 10).fill({
    color: 0x000000,
    alpha: 0.4,
  })
  background.roundRect(138, 51, 34, 40, 4).fill({
    color: 0x000000,
    alpha: 0.4,
  })
  cont.addChild(background)

  const textSpeedBG = new Text({
    text: '888 kmh',
    style: new TextStyle(FONT_STYLE.speedBg),
    x: 170,
    y: 10,
  })
  textSpeedBG.anchor.set(1, 0)
  const textSpeed = new Text({
    text: '',
    style: new TextStyle(FONT_STYLE.speed),
    x: 170,
    y: 10,
  })
  textSpeed.anchor.set(1, 0)
  const textOdo = new Text({
    text: '',
    style: new TextStyle(FONT_STYLE.odo),
    x: 22,
    y: 72,
  })
  const textGear = new Text({
    text: 'P',
    style: new TextStyle(FONT_STYLE.gear),
    x: 145,
    y: 55,
  })

  cont.addChild(textSpeedBG)
  cont.addChild(textSpeed)
  cont.addChild(textGear)
  cont.addChild(textOdo)

  hudObj.speed = textSpeed
  hudObj.gear = textGear
  hudObj.odo = textOdo
  updateHUD(startSpeed, 0, 0)
  app.stage.addChild(cont)
  addScore(app)
  addLogo(app)
}

export function updateHUD(speed: number, distance: number, score: number) {
  hudObj.speed.text = `${'' + Math.floor(speed)} kmh`
  hudObj.gear.text = calculateGear(speed)
  hudObj.odo.text = `${'' + (Math.floor(distance / 10) / 100).toFixed(1).padStart(7, '0')} km`
  updateScore(score)
}
