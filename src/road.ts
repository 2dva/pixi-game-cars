import { Application, Container, Graphics, GraphicsContext } from "pixi.js";

export function drawDashedLine(
  ctx: GraphicsContext,
  cx: number,
  cy: number,
  dash: number,
  gap: number
) {
  const segmentCount = Math.floor(600 / (dash + gap));

  for (let i = 0; i < segmentCount; i++) {
    const start = i * (dash + gap);
    const end = start + dash
    const x = cx, y1 = cy + start, y2 = cy + end
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
  }
  ctx.setStrokeStyle({ width: 5, color: 0xe5e5e5, alignment: 0 });
  ctx.stroke();
}

export function addRoadMark(app: Application) {
  const dashed = new GraphicsContext();

  for (let i = 0; i < 7; i++) {
    drawDashedLine(dashed, 120 + i * 100, 0, 20, 10);
  }

    const shape = new Graphics(dashed);

  // const cont = new Container();
  // cont.addChild(shape);

  // Add the car container to the stage.
  app.stage.addChild(shape);
}
