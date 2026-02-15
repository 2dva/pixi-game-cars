import { Application, Container, Graphics, GraphicsContext } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_WIDTH, ROAD_LEFT_GAP, SIDEWALK_WIDTH } from './configuration'

// Road configuration
const LINE_WIDTH = 5
const LINE_DASH = 30
const LINE_GAP = 44
const LANE_COUNT = 5
const LINE_REPEAT = LINE_DASH + LINE_GAP
const LINE_COLOR = 0xe5e5e5
const LINE_YELLOW_COLOR = 0xa99f2f
const SIDEWALK_BORDER_COLOR = 0x717475

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
  const container = new Container()
  const lineCtx = new GraphicsContext()

  drawSolidLine(lineCtx, ROAD_LEFT_GAP - LINE_WIDTH)
  drawSolidLine(lineCtx, ROAD_LEFT_GAP + LINE_WIDTH)
  drawSidewalkLine(lineCtx, APP_WIDTH - SIDEWALK_WIDTH)

  for (let i = 1; i <= LANE_COUNT; i++) {
    drawDashedLine(lineCtx, ROAD_LEFT_GAP + i * ROAD_LANE_WIDTH)
  }

  const lines = new Graphics(lineCtx)

  // Add the car container to the stage.
  container.addChild(lines)
  app.stage.addChild(container)
  road = container
}

export function moveRoad(speed: number) {
  if (!road) return
  roadDelta += speed * 0.1
  roadDelta = roadDelta % (LINE_GAP + LINE_DASH)
  road.position.set(0, roadDelta - LINE_REPEAT)
}
