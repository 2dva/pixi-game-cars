import { DOMContainer } from 'pixi.js'
import { DomInput } from './DomInput'

export const inputNameEvent = 'inputNameEvent'

export class InputName extends DOMContainer {
  input: DomInput
  keydownHandlerBound = this.keydownHandler.bind(this)

  constructor() {
    super()
    this.input = new DomInput()
    this.element = this.input
  }

  activate() {
    const input = this.input
    setTimeout(() => {
      input.focus()
      window.addEventListener('keydown', this.keydownHandlerBound)
    }, 400)
  }

  private keydownHandler(event: KeyboardEvent) {
    if (event.code === 'Enter' || event.code === 'NumpadEnter')
      this.emit('inputNameEvent', this.input.value)
  }

  destroy(options?: boolean): void {
    this.removeAllListeners()
    window.removeEventListener('keydown', this.keydownHandlerBound)
    super.destroy(options)
  }
}
