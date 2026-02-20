import { Application, Assets, Bounds, Container, Sprite, Text, Texture } from 'pixi.js'
import { GifSprite, type GifSource } from 'pixi.js/gif'
import { checkCollisionWithObject } from '../collision'
import {
  APP_HEIGHT,
  APP_WIDTH,
  ROAD_LANE_COUNT,
  ROAD_LANE_WIDTH,
  ROAD_LEFT_GAP,
  SIDEWALK_WIDTH,
} from '../configuration'
import type { State } from '../state'
import { rollBoolDice } from '../utils'
import { Road } from './Road'

const STAGE_PADDING = 120

const FONT_STYLE = {
  letterA: {
    fontFamily: 'Arial',
    fontSize: 112,
    fill: 0xe5e5e5,
  },
}

const coinAsset = 'terrain/coin.gif'
const terrainAssets = [
  {
    alias: 'tree01',
    src: 'terrain/tree01.png',
  },
]

type claimableType = 'coin'

export class Terrain {
  terrainContainer: Container
  terrainObjects: Set<Sprite | GifSprite>
  claimableObjects: Set<Sprite | GifSprite>
  road: Road
  coinSource!: GifSource
  letterAtexture!: Texture

  constructor() {
    this.terrainContainer = new Container()
    this.terrainObjects = new Set()
    this.claimableObjects = new Set()
    this.road = new Road()
  }

  async preloadAssets() {
    await Assets.load(terrainAssets)
    this.coinSource = await Assets.load(coinAsset)
  }

  setup(app: Application) {
    const letterA = new Text({ text: 'A', style: FONT_STYLE.letterA })
    this.letterAtexture = app.renderer.generateTexture(letterA)

    this.road.setup(app)
    app.stage.addChild(this.terrainContainer)
  }

  draw({ speed }: State) {
    this.road.draw(speed)

    this.terrainObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      // объект остался за экраном - убираем со сцены
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeObject(sprite)
      }
    })
  }

  addCoin(x: number) {
    const sprite = new GifSprite({ source: this.coinSource })
    sprite.anchor.set(0.5)
    sprite.scale.set(0.3)
    sprite.x = x
    sprite.y = -50
    sprite.animationSpeed = 1.7
    this.terrainObjects.add(sprite)
    this.claimableObjects.add(sprite)
    this.terrainContainer.addChild(sprite)
  }

  private addObject(assetName: string | Sprite, x: number) {
    const sprite = assetName instanceof Sprite ? assetName : Sprite.from(assetName)
    sprite.anchor.set(0.5)
    sprite.scale.set(0.6)
    sprite.x = x
    sprite.y = -50
    this.terrainObjects.add(sprite)
    this.terrainContainer.addChild(sprite)
  }

  private removeObject(sprite: Sprite | GifSprite) {
    this.terrainObjects.delete(sprite)
    this.claimableObjects.delete(sprite)
    this.terrainContainer.removeChild(sprite)
    sprite.destroy()
  }

  checkObjectRelease() {
    const laneNumber = 1 + Math.floor(Math.random() * ROAD_LANE_COUNT)
    this.addCoin(ROAD_LEFT_GAP + laneNumber * ROAD_LANE_WIDTH - ROAD_LANE_WIDTH / 2)

    // бросаем кубик, и если ок, то рисуем объект
    if (rollBoolDice(3)) {
      this.addObject('tree01', APP_WIDTH - 15)
    }
    // рисуем А-полосу
    this.addObject(new Sprite(this.letterAtexture), APP_WIDTH - SIDEWALK_WIDTH - ROAD_LANE_WIDTH / 2)
  }

  checkObjectIsClaimed(heroBounds: Bounds): claimableType | null {
    for (const sprite of this.claimableObjects) {
      const bounds = sprite.getBounds()
      const claimed = checkCollisionWithObject(heroBounds, bounds)
      if (claimed) {
        this.removeObject(sprite)
        return 'coin'
      }
    }
    return null
  }
}
