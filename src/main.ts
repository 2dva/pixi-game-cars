import { Application } from 'pixi.js'
import { APP_BACKGROUND, APP_HEIGHT, APP_WIDTH } from './configuration'
import { Game } from './Game'

const app = new Application()

// @ts-expect-error this is for debug extension
globalThis.__PIXI_APP__ = app
window.__PIXI_DEVTOOLS__ = { app }
;(async () => {
  const root = document.getElementById('canvasRoot')!
  // Intialize the application.
  await app.init({
    width: APP_WIDTH,
    height: APP_HEIGHT,
    backgroundColor: APP_BACKGROUND,
    resizeTo: root,
    autoDensity: true,
  })

  // Then adding the application's canvas to the DOM.
  root.appendChild(app.canvas)

  // Create and launch game instance
  const game = new Game(app)
  await game.setup()
  game.launch()
})()
