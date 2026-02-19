import { Application, Assets, Bounds, Container, Graphics, GraphicsContext, Sprite } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_COUNT, ROAD_LANE_WIDTH, ROAD_LEFT_GAP, SIDEWALK_WIDTH } from '../configuration'
import { rollBoolDice } from '../utils'
import { GifSource, GifSprite } from 'pixi.js/gif'
import type { State } from '../state'

// Road configuration
const LINE_WIDTH = 5
const LINE_DASH = 30
const LINE_GAP = 44
const LINE_REPEAT = LINE_DASH + LINE_GAP
const LINE_COLOR = 0xe5e5e5
const LINE_YELLOW_COLOR = 0xa99f2f
const SIDEWALK_BORDER_COLOR = 0x717475
const STAGE_PADDING = 120

const terrainObjects: Set<Sprite | GifSprite> = new Set()
const terrainContainer = new Container()

const claimableObjects: Set<Sprite | GifSprite> = new Set()
type claimableType = 'coin'

const terrainAssets = [
  {
    alias: 'tree01',
    src: 'terrain/tree01.png',
  },
]
const coinAsset = 'terrain/coin.gif'

let coinSource: GifSource

export async function preloadTerrainAssets() {
  await Assets.load(terrainAssets)
  coinSource = await Assets.load(coinAsset)
}

// Draw single line
function drawDashedLine(ctx: GraphicsContext, cx: number) {
  const segmentCount = Math.floor((APP_HEIGHT + 2 * LINE_REPEAT) / LINE_REPEAT)

  for (let i = 0; i < segmentCount; i++) {
    const start = i * LINE_REPEAT
    const end = start + LINE_DASH
    const x = cx,
      y1 = start,
      y2 = end
    ctx.moveTo(x, y1)
    ctx.lineTo(x, y2)
  }
  ctx.setStrokeStyle({ width: LINE_WIDTH, color: LINE_COLOR, alignment: 0 })
  ctx.stroke()
}

// Draw yellow line
function drawSolidLine(ctx: GraphicsContext, cx: number) {
  ctx.moveTo(cx, -LINE_REPEAT)
  ctx.lineTo(cx, APP_HEIGHT + LINE_REPEAT)
  ctx.setStrokeStyle({ width: LINE_WIDTH, color: LINE_YELLOW_COLOR })
  ctx.stroke()
}

// Draw single line
function drawSidewalkLine(ctx: GraphicsContext, cx: number) {

  ctx.moveTo(cx-3, -LINE_REPEAT)
  ctx.lineTo(cx-3, APP_HEIGHT + LINE_REPEAT)
  ctx.setStrokeStyle({ width: LINE_WIDTH + 4, color: 0x242424, alpha: 0.5 })
  ctx.stroke()

  const segmentCount = Math.floor((APP_HEIGHT + 2 * LINE_REPEAT) / LINE_REPEAT)
  for (let i = 0; i < segmentCount; i++) {
    const start = i * LINE_REPEAT + 3
    ctx.moveTo(cx, start)
    ctx.lineTo(cx, start + LINE_REPEAT - 3)
  }
  ctx.setStrokeStyle({ width: LINE_WIDTH, color: SIDEWALK_BORDER_COLOR, alignment: 0 })
  ctx.stroke()
}

let road: Container | null = null
let roadDelta = 0

export function addRoadMark(app: Application) {
  road = new Container()

  const lineCtx = new GraphicsContext()

  drawSolidLine(lineCtx, ROAD_LEFT_GAP - LINE_WIDTH)
  drawSolidLine(lineCtx, ROAD_LEFT_GAP + LINE_WIDTH)
  drawSidewalkLine(lineCtx, APP_WIDTH - SIDEWALK_WIDTH)

  for (let i = 1; i <= ROAD_LANE_COUNT; i++) {
    drawDashedLine(lineCtx, ROAD_LEFT_GAP + i * ROAD_LANE_WIDTH)
  }

  const lines = new Graphics(lineCtx)

  // Add the car container to the stage.
  road.addChild(lines)
  app.stage.addChild(road)
  app.stage.addChild(terrainContainer)
}

function addCoin(x: number) {
  const sprite = new GifSprite({ source: coinSource })
  sprite.anchor.set(0.5)
  sprite.scale.set(0.3)
  sprite.x = x
  sprite.y = -50
  sprite.animationSpeed = 1.7
  terrainObjects.add(sprite)
  claimableObjects.add(sprite)
  terrainContainer.addChild(sprite)
}

function addTerrainObject(assetName: string, x: number) {
  const sprite = Sprite.from(assetName)
  sprite.anchor.set(0.5)
  sprite.scale.set(0.6)
  sprite.x = x
  sprite.y = -50
  terrainObjects.add(sprite)
  terrainContainer.addChild(sprite)
}

function removeTerrainObject(sprite: Sprite | GifSprite) {
  terrainObjects.delete(sprite)
  claimableObjects.delete(sprite)
  terrainContainer.removeChild(sprite)
  sprite.destroy()
}

function animateRoad(speed: number) {
  if (!road) return
  roadDelta += speed * 0.1
  roadDelta = roadDelta % (LINE_GAP + LINE_DASH)
  road.position.set(0, roadDelta - LINE_REPEAT)
}

export function animateTerrain({ speed }: State) {
  animateRoad(speed)

  terrainObjects.forEach((sprite) => {
    sprite.y += speed * 0.1
    // объект остался за экраном - убираем со сцены
    if (sprite.y > APP_HEIGHT + STAGE_PADDING) {
      removeTerrainObject(sprite)
    }
  })
}

export function checkReleaseTerrain() {
  const laneNumber = 1 + Math.floor(Math.random() * ROAD_LANE_COUNT)
  addCoin(ROAD_LEFT_GAP + laneNumber * ROAD_LANE_WIDTH - ROAD_LANE_WIDTH / 2)

  // бросаем кубик, и если ок, то рисуем объект
  if (rollBoolDice(3)) {
    addTerrainObject('tree01', APP_WIDTH - 15)
  }
}

function checkCollisionObject(a: Bounds, b: Bounds): boolean {
  const rightmostLeft = a.left < b.left ? b.left : a.left
  const leftmostRight = a.right > b.right ? b.right : a.right
  if (leftmostRight < rightmostLeft) return false

  const bottommostTop = a.top < b.top ? b.top : a.top
  const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom
  return topmostBottom > bottommostTop
}

export function checkObjectIsClaimed(heroBounds: Bounds): claimableType | null {
  for (const sprite of claimableObjects) {
    const bounds = sprite.getBounds()
    const claimed = checkCollisionObject(heroBounds, bounds)
    if (claimed) {
      removeTerrainObject(sprite)
      return 'coin'
    }
  }
  return null
}
