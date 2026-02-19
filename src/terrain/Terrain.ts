import { Application, Assets, Bounds, Container, Sprite } from 'pixi.js'
import { GifSprite, type GifSource } from 'pixi.js/gif'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP } from '../configuration'
import type { State } from '../state'
import { rollBoolDice } from '../utils'
import { Road } from './road'

const STAGE_PADDING = 120

const terrainAssets = [
  {
    alias: 'tree01',
    src: 'terrain/tree01.png',
  },
]
const coinAsset = 'terrain/coin.gif'

let coinSource: GifSource
type claimableType = 'coin'

export class Terrain {
  road: Road
  terrainObjects: Set<Sprite | GifSprite>
  claimableObjects: Set<Sprite | GifSprite>
  terrainContainer: Container

  constructor() {
    this.terrainObjects = new Set()
    this.claimableObjects = new Set()
    this.terrainContainer = new Container()
    this.road = new Road()
  }

  async preloadAssets() {
    await Assets.load(terrainAssets)
    coinSource = await Assets.load(coinAsset)
  }

  setup(app: Application) {
    this.road.setup(app)
    app.stage.addChild(this.terrainContainer)
  }

  draw({ speed }: State) {
    this.road.draw(speed)

    this.terrainObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      // объект остался за экраном - убираем со сцены
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeTerrainObject(sprite)
      }
    })
  }

  addCoin(x: number) {
    const sprite = new GifSprite({ source: coinSource })
    sprite.anchor.set(0.5)
    sprite.scale.set(0.3)
    sprite.x = x
    sprite.y = -50
    sprite.animationSpeed = 1.7
    this.terrainObjects.add(sprite)
    this.claimableObjects.add(sprite)
    this.terrainContainer.addChild(sprite)
  }

  addTerrainObject(assetName: string, x: number) {
    const sprite = Sprite.from(assetName)
    sprite.anchor.set(0.5)
    sprite.scale.set(0.6)
    sprite.x = x
    sprite.y = -50
    this.terrainObjects.add(sprite)
    this.terrainContainer.addChild(sprite)
  }

  removeTerrainObject(sprite: Sprite | GifSprite) {
    this.terrainObjects.delete(sprite)
    this.claimableObjects.delete(sprite)
    this.terrainContainer.removeChild(sprite)
    sprite.destroy()
  }

  checkReleaseTerrain() {
    const laneNumber = 1 + Math.floor(Math.random() * ROAD_LANE_COUNT)
    this.addCoin(ROAD_LEFT_GAP + laneNumber * ROAD_LANE_WIDTH - ROAD_LANE_WIDTH / 2)

    // бросаем кубик, и если ок, то рисуем объект
    if (rollBoolDice(3)) {
      this.addTerrainObject('tree01', APP_WIDTH - 15)
    }
  }

  checkCollisionObject(a: Bounds, b: Bounds): boolean {
    const rightmostLeft = a.left < b.left ? b.left : a.left
    const leftmostRight = a.right > b.right ? b.right : a.right
    if (leftmostRight < rightmostLeft) return false

    const bottommostTop = a.top < b.top ? b.top : a.top
    const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom
    return topmostBottom > bottommostTop
  }

  checkObjectIsClaimed(heroBounds: Bounds): claimableType | null {
    for (const sprite of this.claimableObjects) {
      const bounds = sprite.getBounds()
      const claimed = this.checkCollisionObject(heroBounds, bounds)
      if (claimed) {
        this.removeTerrainObject(sprite)
        return 'coin'
      }
    }
    return null
  }
}
