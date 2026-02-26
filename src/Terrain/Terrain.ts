import { Assets, Container, Sprite, Text, Texture, type Renderer } from 'pixi.js'
import { GifSprite } from 'pixi.js/gif'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_WIDTH, SIDEWALK_WIDTH, STAGE_PADDING } from '../configuration'
import fontStyles from '../fontStyles.json'
import type { State } from '../state'
import type { BoundsLike, IMajorGameContainer } from '../types'
import { rollDiceBool } from '../utils'
import { ClaimableObjects } from './ClaimableObjects'
import { Road } from './Road'

const terrainAssets = [
  { alias: 'tree01', src: 'terrain/tree01.png' },
  { alias: 'tree02', src: 'terrain/tree02.png' },
  { alias: 'tree03', src: 'terrain/tree03.png' },
  { alias: 'tree04', src: 'terrain/tree04.png' },
]

const BASE_Y_POS = -50
const terrainAliases = terrainAssets.map((el) => el.alias)

let elapsedDistance = 0.0
let distanceSegments = 0
const segmentSizeInMeters = 10.0
function runEverySegment(deltaDistance: number, cb: (segments: number) => void) {
  elapsedDistance += deltaDistance
  if (elapsedDistance < segmentSizeInMeters) return
  elapsedDistance -= segmentSizeInMeters
  distanceSegments++
  cb(distanceSegments)
}

export class Terrain extends Container implements IMajorGameContainer {
  terrainObjects: Set<Sprite | GifSprite>
  road: Road
  letterAtexture!: Texture
  claimable: ClaimableObjects

  constructor(renderer: Renderer) {
    super()
    this.terrainObjects = new Set()
    this.road = new Road()
    this.claimable = new ClaimableObjects(this)

    const letterA = new Text({ text: 'A', style: fontStyles.fontRoadLetterA })
    this.letterAtexture = renderer.generateTexture(letterA)
  }

  async preloadAssets() {
    await Assets.load(terrainAssets)
    await this.claimable.preloadAssets()
  }

  setup(stage: Container) {
    this.road.setup(stage)
    stage.addChild(this)
  }

  reset() {
    this.terrainObjects.forEach((s) => this.removeObject(s))
    this.road.reset()
    this.claimable.reset()
  }

  draw({ speed, deltaDistance }: State) {
    this.road.draw(speed)
    this.claimable.draw(speed)

    runEverySegment(deltaDistance, (segments: number) => {
      this.checkObjectRelease(segments)
    })

    this.terrainObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      // объект остался за экраном - убираем со сцены
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeObject(sprite)
      }
    })
  }

  private addObject(assetName: string | Sprite, scale: number, x: number, y: number = BASE_Y_POS) {
    const sprite = assetName instanceof Sprite ? assetName : Sprite.from(assetName)
    sprite.cullable = true
    sprite.anchor.set(0.5)
    sprite.scale.set(scale)
    sprite.x = x
    sprite.y = y
    this.terrainObjects.add(sprite)
    this.addChild(sprite)
  }

  private removeObject(sprite: Sprite | GifSprite) {
    this.terrainObjects.delete(sprite)
    this.removeChild(sprite)
    sprite.destroy()
  }

  private drawTrees() {
    // бросаем кубик, и если ок, то рисуем статичный объект
    let i = 0
    if (rollDiceBool(3)) {
      for (const alias of terrainAliases) {
        if (rollDiceBool(2 + i)) {
          this.addObject(
            alias,
            0.5 + Math.random()*0.2,
            APP_WIDTH - 20 + Math.random() * 30,
            BASE_Y_POS + Math.random() * 50
          )
        }
        i++
      }
    }
  }

  checkObjectRelease(segments: number) {
    // рисуем монеты
    if (segments % 10 === 8) {
      this.claimable.checkObjectRelease()
    }

    // рисуем деревья
    this.drawTrees()

    // рисуем А-полосу каждые 200 метров
    if (segments % 20 === 0) {
      this.addObject(new Sprite(this.letterAtexture), 0.6, APP_WIDTH - SIDEWALK_WIDTH - ROAD_LANE_WIDTH / 2)
    }
  }

  checkObjectIsClaimed(heroBounds: BoundsLike): number {
    return this.claimable.checkObjectIsClaimed(heroBounds)
  }
}
