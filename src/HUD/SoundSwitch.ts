import { Assets, Container, Sprite, Texture } from 'pixi.js'
import { gameConfig, zIndexFixed } from '../configuration'
import { Sound } from '../sound'

export class SoundSwitch extends Container {
  soundOn = false
  sprite!: Sprite

  constructor() {
    super()
    this.zIndex = zIndexFixed.interactives
  }

  async preloadAssets() {
    await Assets.load([
      { alias: 'sound_off', src: 'hud/sound_off.png' },
      { alias: 'sound_on', src: 'hud/sound_on.png' },
    ])
  }

  setup(parent: Container) {
    this.soundOn = !gameConfig.soundMutedByDefault
    Howler.mute(!!gameConfig.soundMutedByDefault)

    const POS_X = gameConfig.appWidth - 100
    const POS_Y = gameConfig.appHeight - 100

    this.position.set(POS_X, POS_Y)

    const sprite = Sprite.from(this.soundOn ? 'sound_on' : 'sound_off')
    sprite.width = 70
    sprite.scale.y = sprite.scale.x
    sprite.alpha = 0.4
    sprite.eventMode = 'static'
    sprite.cursor = 'pointer'
    sprite.on('pointerdown', () => {
      this.soundOn = !this.soundOn
      this.draw()
      Sound.mute(!this.soundOn)
    })
    this.sprite = sprite

    this.addChild(sprite)
    parent.addChild(this)
  }

  draw() {
    this.sprite.texture = Texture.from(this.soundOn ? 'sound_on' : 'sound_off')
  }
}
