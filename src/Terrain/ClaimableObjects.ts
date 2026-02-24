import { Assets, Container, Sprite } from 'pixi.js'
import { GifSource, GifSprite } from 'pixi.js/gif'
import { checkCollisionWithObject } from '../collision'
import { APP_HEIGHT, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP, STAGE_PADDING } from '../configuration'
import type { BoundsLike } from '../types'

export type claimableType = 'coin'

const COIN_SCORE = 100

const coinAsset = 'terrain/coin.gif'

export class ClaimableObjects {
  claimableObjects: Set<Sprite | GifSprite>
  coinSource!: GifSource
  container: Container

  constructor(container: Container) {
    this.claimableObjects = new Set()
    this.container = container
  }

  async preloadAssets() {
    this.coinSource = await Assets.load(coinAsset)
  }

  draw(speed: number) {
    this.claimableObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeObject(sprite)
      }
    })
  }

  reset() {
    this.claimableObjects.forEach((s) => this.removeObject(s))
  }

  addCoin(x: number) {
    const sprite = new GifSprite({ source: this.coinSource })
    sprite.anchor.set(0.5)
    sprite.scale.set(0.3)
    sprite.x = x
    sprite.y = -50
    sprite.animationSpeed = 1.7
    this.claimableObjects.add(sprite)
    this.container.addChild(sprite)
  }

  checkObjectRelease() {
    const laneNumber = 1 + Math.floor(Math.random() * ROAD_LANE_COUNT)
    this.addCoin(ROAD_LEFT_GAP + laneNumber * ROAD_LANE_WIDTH - ROAD_LANE_WIDTH / 2)
  }

  private removeObject(sprite: Sprite | GifSprite) {
    this.claimableObjects.delete(sprite)
    this.container.removeChild(sprite)
    sprite.destroy()
  }

  checkObjectIsClaimed(heroBounds: BoundsLike): number {
    for (const sprite of this.claimableObjects) {
      const bounds = sprite.getBounds()
      const claimed = checkCollisionWithObject(heroBounds, bounds)
      if (claimed) {
        this.removeObject(sprite)
        return COIN_SCORE
      }
    }
    return 0
  }
}
