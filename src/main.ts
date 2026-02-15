import { Application, Assets, GraphicsContext, Ticker, type TickerCallback } from "pixi.js";
import { addBackground } from "./background";
import { addCars, animateCars, preloadCarAssets } from "./cars";
import { addHero, moveHero, preloadHeroAsset } from "./hero";
import { Controller } from "./controller";
import { addRoadMark, drawDashedLine } from "./road";

const app = new Application();

async function setup() {
  // Intialize the application.
  await app.init({ width: 800, height: 600, backgroundColor: 0x545457 });

  // Then adding the application's canvas to the DOM body.
  document.body.appendChild(app.canvas);
}

async function preload() {
  Assets.init({ basePath: "assets/" });
  await preloadCarAssets()
  await preloadHeroAsset();
}

(async () => {
  await setup();
  await preload();

  addBackground(app);
  addRoadMark(app);
  addCars(app);
  addHero(app);

  const controller = new Controller();

  app.ticker.add((time: Ticker) => {
    animateCars(app, time);

    const rightPressed = controller.keys.right.pressed;
    const leftPressed = controller.keys.left.pressed;
    let delta = 0
    if (rightPressed) delta = 3
    if (leftPressed) delta = -3
    if (delta !== 0) moveHero(app, delta);
  });
})();
