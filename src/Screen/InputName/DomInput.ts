import { uid } from 'pixi.js'
import './style.css'

export class DomInput extends HTMLInputElement {
  constructor(filter?: RegExp) {
    super()
    this.id = 'inputName' + uid()
    this.type = 'text'
    this.maxLength = 6
    this.className = 'cl-screenname-input'
    if (filter) {
      this.addEventListener('input', () => {
        this.value = this.value.replace(filter, '')
      })
    }
  }
}

customElements.define('pixi-dom-input', DomInput, { extends: 'input' })
