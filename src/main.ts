import { Application } from 'pixi.js'
import { APP_BACKGROUND, APP_HEIGHT, APP_WIDTH } from './configuration'
import { Game } from './Game'

const app = new Application()

// @ts-expect-error this is for debug extension
globalThis.__PIXI_APP__ = app
// @ts-expect-error this is for debug extension
window.__PIXI_DEVTOOLS__ = { app }

try {
  console.log('App env version:', import.meta.env.VITE_APP_VERSION)
  console.log('App win version:', window.__APP_VERSION__)
} catch(e) {
  // fail
}

;(async () => {
  // Intialize the application.
  await app.init({ width: APP_WIDTH, height: APP_HEIGHT, backgroundColor: APP_BACKGROUND })

  // Then adding the application's canvas to the DOM body.
  document.body.appendChild(app.canvas)

  const game = new Game(app)
  await game.setup()
  game.launch()
})()
