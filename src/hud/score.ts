import { BitmapText, Container, Graphics } from 'pixi.js'

const POS_X = 15
const POS_Y = 20

const FONT_STYLE = {
  score: {
    fontFamily: 'alarm clock, Arial',
    fontSize: 36,
    fill: '#ffffff',
    stroke: '#000000',
  },
}

const TINT_DEFAULT = 0xf5f5f5
const TINT_BRIGHT = 0xfff568

export class Score extends Container {
  bitmap!: BitmapText

  constructor() {
    super()
  }

  setup(parent: Container) {
    this.position.set(POS_X, POS_Y)

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
    textScore.tint = TINT_DEFAULT
    textScore.anchor.set(1, 0)
    this.bitmap = textScore
    
    this.addChild(background)
    this.addChild(textScore)
    parent.addChild(this)
  }

  draw(score: number) {
    if (String(score) != this.bitmap.text) {
      this.bitmap.text = `${score}`
      this.bitmap.tint = TINT_BRIGHT
      this.bitmap.style.letterSpacing = 0.8
      this.bitmap.style.fontWeight = 'bold'
      setTimeout(() => {
        this.bitmap.tint = TINT_DEFAULT
        this.bitmap.style.letterSpacing = 0
        this.bitmap.style.fontWeight = 'normal'
      }, 100)
    }
  }
}
