import { Application, Graphics } from "pixi.js";

const app = new Application();

await app.init({ width: 800, height: 600, backgroundColor: 0x1099bb });
document.body.appendChild(app.canvas);

const graphics = new Graphics();
graphics.rect(0, 0, 100, 100);
graphics.fill(0xde3249);
graphics.x = 350;
graphics.y = 250;
graphics.pivot.set(50, 50);
app.stage.addChild(graphics);

app.ticker.add((time) => {
  graphics.rotation += 0.04 * time.deltaTime;
});
