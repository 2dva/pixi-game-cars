import { Application } from 'pixi.js'
import { gameConfig } from './configuration'
import { Game } from './Game'

const app = new Application()
const root = document.getElementById('canvasRoot')!

root.classList.add(gameConfig.isMobilePlatform ? 'canvas-root_mobile' : 'canvas-root_desktop')

// @ts-expect-error this is for debug extension
globalThis.__PIXI_APP__ = app
window.__PIXI_DEVTOOLS__ = { app }
;(async () => {
  // Intialize the application.
  await app.init({
    width: gameConfig.appWidth,
    height: gameConfig.appHeight,
    backgroundColor: gameConfig.appBackground,
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
