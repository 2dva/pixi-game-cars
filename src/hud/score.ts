import { Application, BitmapText, Container, Graphics } from 'pixi.js'

type ScoreObject = {
  score: BitmapText
}

const scoreObj: ScoreObject = {
  score: new BitmapText(),
}

const FONT_STYLE = {
  score: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ffffff',
    stroke: '#000000',
  },
}

export function addScore(app: Application) {
  const cont = new Container()
  cont.position.set(20, 20)
  const background = new Graphics()
  background.roundRect(0, 0, 180, 40, 10).fill({
    color: 0x000000,
    alpha: 0.4,
  })
  const textScore = new BitmapText({
    text: '0',
    style: FONT_STYLE.score,
    x: 170,
    y: 4,
  })
  textScore.anchor.set(1, 0)
  cont.addChild(background)
  cont.addChild(textScore)

  scoreObj.score = textScore
  app.stage.addChild(cont)
}

export function updateScore(score: number) {
  scoreObj.score.text = `${score}`
}
