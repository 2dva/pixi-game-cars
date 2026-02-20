import { Application, BitmapText, Container, Graphics } from 'pixi.js'

const FONT_STYLE = {
  score: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ffffff',
    stroke: '#000000',
  },
}

const DEFAULT_TINT = 0xf5f5f5

export class Score {
  bitmap!: BitmapText

  constructor() {}

  setup(app: Application) {
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
    textScore.style.letterSpacing = 0
    textScore.style.fontWeight = 'normal'
    textScore.tint = DEFAULT_TINT
    textScore.anchor.set(1, 0)
    cont.addChild(background)
    cont.addChild(textScore)

    this.bitmap = textScore
    app.stage.addChild(cont)
  }

  draw(score: number) {
    if (String(score) != this.bitmap.text) {
      this.bitmap.text = `${score}`
      this.bitmap.tint = 0xfff568
      this.bitmap.style.letterSpacing = 0.8
      this.bitmap.style.fontWeight = 'bold'
      setTimeout(() => {
        this.bitmap.tint = DEFAULT_TINT
        this.bitmap.style.letterSpacing = 0
        this.bitmap.style.fontWeight = 'normal'
      }, 100)
    }
  }
}
