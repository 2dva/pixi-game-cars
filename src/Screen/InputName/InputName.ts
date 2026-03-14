import { Container, DOMContainer, HTMLText } from 'pixi.js'
import { gameConfig } from '../../configuration'
import { DomInput } from './DomInput'

export const inputNameEvent = 'inputNameEvent'

export class InputName extends Container {
  input: DomInput
  keydownHandlerBound = this.keydownHandler.bind(this)

  constructor() {
    super()
    this.input = new DomInput(gameConfig.playerNameInvalidSymbolsRegExp)
    const cont = new DOMContainer({
      element: this.input,
      anchor: 0.5,
    })

    const textOk = new HTMLText({
      text: '<p style="padding: 8px; margin: 0; background-color:#dedede; border-radius: 10px;">OK</p>',
      style: {
        fontFamily: 'Arial',
        fontSize: 36,
        fill: 0x212121,
      },
      x: 165,
      y: 0,
      anchor: 0.5,
    })
    textOk.eventMode = 'static'
    textOk.cursor = 'pointer'
    textOk.on('pointerdown', this.submit, this)

    this.addChild(textOk)
    this.addChild(cont)
  }

  activate(name: string) {
    const input = this.input
    input.value = name
    setTimeout(() => {
      input.focus()
      window.addEventListener('keydown', this.keydownHandlerBound, { capture: true })
    }, 300)
  }

  private keydownHandler(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') this.submit()
  }

  private submit() {
    const value = this.input.value.trim().replace(gameConfig.playerNameInvalidSymbolsRegExp, '')
    this.emit('inputNameEvent', value)
  }

  destroy(options?: boolean): void {
    this.removeAllListeners()
    window.removeEventListener('keydown', this.keydownHandlerBound)
    super.destroy(options)
  }
}
