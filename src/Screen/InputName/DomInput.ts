import fontStyles from '../../fontStyles.json'

export class DomInput extends HTMLInputElement {
  constructor() {
    super()
    this.type = 'text'
    this.maxLength = 6
    Object.assign(this.style, fontStyles.fontStyleInputName)
  }
}

customElements.define('pixi-dom-input', DomInput, { extends: 'input' })
