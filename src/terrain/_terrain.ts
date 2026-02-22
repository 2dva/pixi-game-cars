import { Assets, Bounds, Container, Sprite, Text, Texture, type Renderer } from 'pixi.js'
import { GifSprite } from 'pixi.js/gif'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_WIDTH, SIDEWALK_WIDTH, STAGE_PADDING } from '../configuration'
import type { State } from '../state'
import { rollBoolDice } from '../utils'
import { ClaimableObjects, type claimableType } from './ClaimableObjects'
import { Road } from './_road'

const FONT_STYLE = {
  letterA: {
    fontFamily: 'Arial',
    fontSize: 112,
    fill: 0xe5e5e5,
  },
}

const terrainAssets = [
  {
    alias: 'tree01',
    src: 'terrain/tree01.png',
  },
]

let elapsedDistance = 0.0
function runEveryHundredMeters(deltaDistance: number, cb: () => void) {
  elapsedDistance += deltaDistance
  if (elapsedDistance < 100.0) return
  elapsedDistance -= 100.0
  cb()
}

export class Terrain extends Container {
  terrainObjects: Set<Sprite | GifSprite>
  road: Road
  letterAtexture!: Texture
  claimable: ClaimableObjects

  constructor(renderer: Renderer) {
    super()
    this.terrainObjects = new Set()
    this.road = new Road()
    this.claimable = new ClaimableObjects(this)

    const letterA = new Text({ text: 'A', style: FONT_STYLE.letterA })
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

    runEveryHundredMeters(deltaDistance, () => {
      this.checkObjectRelease()
    })

    this.terrainObjects.forEach((sprite) => {
      sprite.y += speed * 0.1
      // объект остался за экраном - убираем со сцены
      if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
        this.removeObject(sprite)
      }
    })
  }

  private addObject(assetName: string | Sprite, x: number) {
    const sprite = assetName instanceof Sprite ? assetName : Sprite.from(assetName)
    sprite.anchor.set(0.5)
    sprite.scale.set(0.6)
    sprite.x = x
    sprite.y = -50
    this.terrainObjects.add(sprite)
    this.addChild(sprite)
  }

  private removeObject(sprite: Sprite | GifSprite) {
    this.terrainObjects.delete(sprite)
    this.removeChild(sprite)
    sprite.destroy()
  }

  checkObjectRelease() {
    this.claimable.checkObjectRelease()

    // бросаем кубик, и если ок, то рисуем объект
    if (rollBoolDice(3)) {
      this.addObject('tree01', APP_WIDTH - 15)
    }
    // рисуем А-полосу
    this.addObject(new Sprite(this.letterAtexture), APP_WIDTH - SIDEWALK_WIDTH - ROAD_LANE_WIDTH / 2)
  }

  checkObjectIsClaimed(heroBounds: Bounds): claimableType | null {
    return this.claimable.checkObjectIsClaimed(heroBounds)
  }
}
