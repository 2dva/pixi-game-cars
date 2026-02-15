import { Application, Assets, Container, Sprite } from 'pixi.js'

let hero: Sprite | null = null

export async function preloadHeroAsset() {
  const heroAsset = { alias: 'hero', src: 'cars/car00.png' }
  await Assets.load(heroAsset)
}

export function addHero(app: Application) {
  const carContainer = new Container()
  app.stage.addChild(carContainer)
  const car = Sprite.from('hero')
  car.anchor.set(0.5)
  car.x = app.screen.width / 2
  car.y = app.screen.height - 100
  car.scale.set(0.6)
  carContainer.addChild(car)
  hero = car
}

export function moveHero(app: Application, delta: number) {
  const car = hero!
  const newX = car.x + delta
  if (newX > 50 && newX < app.screen.width - 50) {
    car.x = newX
  }
}
