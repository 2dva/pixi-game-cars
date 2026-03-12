import fontStyles from '../../fontStyles.json'

export class DomInput extends HTMLInputElement {
  constructor(filter?: RegExp) {
    super()
    this.type = 'text'
    this.maxLength = 6
    Object.assign(this.style, fontStyles.fontStyleInputName)
    if (filter) {
      this.addEventListener('input', () => {
        this.value = this.value.replace(filter, '')
      })
    }
  }
}

customElements.define('pixi-dom-input', DomInput, { extends: 'input' })
