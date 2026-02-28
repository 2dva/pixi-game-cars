import { Container, Graphics, GraphicsContext } from 'pixi.js'
import { gameConfig } from '../configuration'

// Road configuration
const LINE_WIDTH = 5
const LINE_DASH = 30
const LINE_GAP = 44
const LINE_REPEAT = LINE_DASH + LINE_GAP
const LINE_COLOR_WHITE = 0xe5e5e5
const LINE_COLOR_YELLOW = 0xa99f2f
const SIDEWALK_BORDER_COLOR = 0x717475

export class Road extends Container {
  roadDelta = 0

  constructor() {
    super()
  }

  async preloadAssets() {}

  setup(stage: Container) {
    const lineCtx = new GraphicsContext()

    this.drawSolidLine(lineCtx, gameConfig.roadLeftGap - LINE_WIDTH, LINE_COLOR_YELLOW)
    this.drawSolidLine(lineCtx, gameConfig.roadLeftGap + LINE_WIDTH, LINE_COLOR_YELLOW)
    this.drawSidewalkLine(lineCtx, gameConfig.appWidth - gameConfig.roadSidewalkWidth)

    for (let i = 1; i < gameConfig.roadLaneCount; i++) {
      this.drawDashedLine(lineCtx, gameConfig.roadLeftGap + i * gameConfig.roadLaneWidth)
    }
    this.drawSolidLine(
      lineCtx,
      gameConfig.roadLeftGap + gameConfig.roadLaneCount * gameConfig.roadLaneWidth,
      LINE_COLOR_WHITE
    )

    const lines = new Graphics(lineCtx)

    // Add the car container to the stage.
    this.addChild(lines)
    stage.addChild(this)
  }

  reset() {
    this.roadDelta = 0
  }

  draw(speed: number) {
    this.roadDelta += speed * 0.1
    this.roadDelta = this.roadDelta % (LINE_GAP + LINE_DASH)
    this.position.set(0, this.roadDelta - LINE_REPEAT)
  }

  // Draw single line
  private drawDashedLine(ctx: GraphicsContext, cx: number) {
    const segmentCount = Math.floor((gameConfig.appHeight + 2 * LINE_REPEAT) / LINE_REPEAT)

    for (let i = 0; i < segmentCount; i++) {
      const start = i * LINE_REPEAT
      const end = start + LINE_DASH
      const x = cx,
        y1 = start,
        y2 = end
      ctx.moveTo(x, y1)
      ctx.lineTo(x, y2)
    }
    ctx.setStrokeStyle({ width: LINE_WIDTH, color: LINE_COLOR_WHITE, alignment: 0 })
    ctx.stroke()
  }

  // Draw yellow line
  private drawSolidLine(ctx: GraphicsContext, cx: number, color: number) {
    ctx.moveTo(cx, -LINE_REPEAT)
    ctx.lineTo(cx, gameConfig.appHeight + LINE_REPEAT)
    ctx.setStrokeStyle({ width: LINE_WIDTH, color })
    ctx.stroke()
  }

  // Draw single line
  private drawSidewalkLine(ctx: GraphicsContext, cx: number) {
    ctx.moveTo(cx - 3, -LINE_REPEAT)
    ctx.lineTo(cx - 3, gameConfig.appHeight + LINE_REPEAT)
    ctx.setStrokeStyle({ width: LINE_WIDTH + 4, color: 0x242424, alpha: 0.5 })
    ctx.stroke()

    const segmentCount = Math.floor((gameConfig.appHeight + 2 * LINE_REPEAT) / LINE_REPEAT)
    for (let i = 0; i < segmentCount; i++) {
      const start = i * LINE_REPEAT + 3
      ctx.moveTo(cx, start)
      ctx.lineTo(cx, start + LINE_REPEAT - 3)
    }
    ctx.setStrokeStyle({ width: LINE_WIDTH, color: SIDEWALK_BORDER_COLOR, alignment: 0 })
    ctx.stroke()
  }
}
