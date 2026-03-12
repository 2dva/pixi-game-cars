import { DOMContainer } from 'pixi.js'
import { gameConfig } from '../../configuration'
import { DomInput } from './DomInput'

export const inputNameEvent = 'inputNameEvent'

export class InputName extends DOMContainer {
  input: DomInput
  keydownHandlerBound = this.keydownHandler.bind(this)

  constructor() {
    super()
    this.input = new DomInput(gameConfig.playerNameInvalidSymbolsRegExp)
    this.element = this.input
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
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      const value = this.input.value.trim().replace(gameConfig.playerNameInvalidSymbolsRegExp, '')
      this.emit('inputNameEvent', value)
    }
  }

  destroy(options?: boolean): void {
    this.removeAllListeners()
    window.removeEventListener('keydown', this.keydownHandlerBound)
    super.destroy(options)
  }
}
