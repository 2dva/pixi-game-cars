import { Assets, Container, Sprite } from 'pixi.js'
import { GifSource, GifSprite } from 'pixi.js/gif'
import { checkCollisionWithObject } from '../collision'
import { APP_HEIGHT, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP, STAGE_PADDING } from '../configuration'
import type { BoundsLike } from '../types'
import { rollDiceBool } from '../utils'

const CHANCE_TO_RELEASE_PLATINUM = 15 // 1 to n
const BASE_Y_POS = -60

const coinsConfig = {
  coin: {
    source: { alias: 'coin', src: 'terrain/coin.gif' },
    price: 100,
  },
  coin_platinum: {
    source: { alias: 'coin_platinum', src: 'terrain/coin_platinum.gif' },
    price: 1000,
  },
}
type ClaimableKey = keyof typeof coinsConfig

export class ClaimableObjects {
  activeObjects: Set<Sprite | GifSprite>
  spriteSources: Record<string, GifSource> = {}
  container: Container

  constructor(container: Container) {
    this.activeObjects = new Set()
    this.container = container
  }

  async preloadAssets() {
    for (const [k, v] of Object.entries(coinsConfig)) {
      this.spriteSources[k] = await Assets.load(v.source)
    }
  }

  draw(speed: number) {
    this.activeObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeObject(sprite)
      }
    })
  }

  reset() {
    this.activeObjects.forEach((s) => this.removeObject(s))
  }

  addObject(key: ClaimableKey, x: number) {
    const sprite = new GifSprite({ source: this.spriteSources[key] })
    sprite.anchor.set(0.5)
    sprite.scale.set(0.3)
    sprite.x = x
    sprite.y = BASE_Y_POS
    sprite.label = key
    sprite.animationSpeed = 1.7
    this.activeObjects.add(sprite)
    this.container.addChild(sprite)
  }

  checkObjectRelease() {
    const laneNumber = 1 + Math.floor(Math.random() * ROAD_LANE_COUNT)
    const claimableKey = rollDiceBool(CHANCE_TO_RELEASE_PLATINUM) ? 'coin_platinum' : 'coin'
    this.addObject(claimableKey, ROAD_LEFT_GAP + laneNumber * ROAD_LANE_WIDTH - ROAD_LANE_WIDTH / 2)
  }

  private removeObject(sprite: Sprite | GifSprite) {
    this.activeObjects.delete(sprite)
    this.container.removeChild(sprite)
    sprite.destroy()
  }

  checkObjectIsClaimed(heroBounds: BoundsLike): number {
    for (const sprite of this.activeObjects) {
      const bounds = sprite.getBounds()
      const claimed = checkCollisionWithObject(heroBounds, bounds)
      if (claimed) {
        const price = coinsConfig[sprite.label as ClaimableKey].price
        this.removeObject(sprite)
        return price
      }
    }
    return 0
  }
}
