import { Application, Container, Graphics, GraphicsContext } from "pixi.js";
// import { DashLine } from "pixi-dashed-line";

const lineDash = 20
const lineGap = 24


function drawDashedLine(
  ctx: GraphicsContext,
  cx: number,
  cy: number
) {

  const segmentCount = Math.floor(650 / (lineDash + lineGap));

  for (let i = 0; i < segmentCount; i++) {
    const start = i * (lineDash + lineGap);
    const end = start + lineDash;
    const x = cx, y1 = cy + start, y2 = cy + end
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
  }
  ctx.setStrokeStyle({ width: 5, color: 0xe5e5e5, alignment: 0 });
  ctx.stroke();
}

let road: Container | null = null
let roadDelta = 0

export function addRoadMark(app: Application) {
  const container = new Container();

  const dashed = new GraphicsContext();

  for (let i = 0; i < 7; i++) {
    drawDashedLine(dashed, 120 + i * 100, 0);
  }

  const lines = new Graphics(dashed);

  // const cont = new Container();
  // cont.addChild(shape);

  // Add the car container to the stage.
  container.addChild(lines)
  app.stage.addChild(container);
  road = container
}

export function moveRoad(speed: number) {
  if (!road) return
  roadDelta += speed * 0.1
  roadDelta = roadDelta % (lineGap + lineDash)
  
  road.position.set(0, roadDelta - 20); 
}