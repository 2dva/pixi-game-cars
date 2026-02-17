import { Application, Assets, Bounds, Container, Sprite } from 'pixi.js'
import { APP_HEIGHT, APP_WIDTH, ROAD_LANE_WIDTH, ROAD_LEFT_GAP } from './configuration'

// Cars configuration
const CAR_COUNT = 5

type CarAlias = 'car01' | 'car02' | 'car03'

type CarData = {
  alias: CarAlias
  src: string
  speed: number
}

type CarConfig = {
  [k in CarAlias]: CarData
}

// Create an array of asset data to load.
const carConfig: CarConfig = {
  car01: { alias: 'car01', src: 'cars/car01.png', speed: 2 + Math.random() * 2 },
  car02: { alias: 'car02', src: 'cars/car02.png', speed: 2 + Math.random() * 2 },
  car03: { alias: 'car03', src: 'cars/car03.png', speed: 2 + Math.random() * 2 },
}

type Car = {
  alias: CarAlias
  sprite: Sprite
}

const cars: Car[] = []
const carAssets: CarAlias[] = ['car01', 'car02', 'car03']

export async function preloadCarAssets() {
  // Load the assets defined above.
  await Assets.load(Object.values(carConfig))
}

export function addCars(app: Application) {
  // Create a container to hold all the car sprites.
  const carContainer = new Container()

  // Add the car container to the stage.
  app.stage.addChild(carContainer)

  // Create a car sprite for each car.
  for (let i = 0; i < CAR_COUNT; i++) {
    // Cycle through the car assets for each sprite.
    const carAsset = carAssets[i % carAssets.length]
    // const carAsset = CarConfig[i % CarConfig.length].alias

    // Create a car sprite.
    const car = Sprite.from(carAsset)

    // Center the sprite anchor.
    car.anchor.set(0.5)

    // Assign additional properties for the animation.
    // car.speed = 2 + Math.random() * 2

    // Randomly position the car sprite around the stage.
    car.x = ROAD_LEFT_GAP + 50 + ROAD_LANE_WIDTH * i
    car.y = Math.random() * 200 + 200

    // Randomly scale the car sprite to create some variety.
    car.scale.set(0.6)

    // Add the car sprite to the car container.
    carContainer.addChild(car)

    // Add the car sprite to the car array.
    cars.push({ alias: carAsset, sprite: car })
  }
}

export function animateCars(speed: number) {
  // Define the padding around the stage where cares are considered out of sight.
  const stagePadding = 100
  const boundWidth = APP_WIDTH + stagePadding * 2
  const boundHeight = APP_HEIGHT + stagePadding * 2

  // Iterate through each car sprite.
  cars.forEach(({ sprite, alias }) => {
    // Animate the car movement direction according to the turn speed.

    // Animate the car position according to the direction and speed.
    const deltaSpeed = -carConfig[alias].speed + speed * 0.1
    sprite.y += deltaSpeed

    // Wrap the car position when it goes out of bounds.
    if (sprite.x < -stagePadding) {
      sprite.x += boundWidth
    }
    if (sprite.x > APP_WIDTH + stagePadding) {
      sprite.x -= boundWidth
    }
    if (sprite.y < -stagePadding) {
      sprite.y += boundHeight
    }
    if (sprite.y > APP_HEIGHT + stagePadding) {
      sprite.y -= boundHeight
    }
  })
}

function checkCollisionOneCar(a: Bounds, b: Bounds) {
    const rightmostLeft = a.left < b.left ? b.left : a.left
    const leftmostRight = a.right > b.right ? b.right : a.right

    if (leftmostRight <= rightmostLeft) {
      return false
    }

    const bottommostTop = a.top < b.top ? b.top : a.top
    const topmostBottom = a.bottom > b.bottom ? b.bottom : a.bottom

    return topmostBottom > bottommostTop
}

export function checkCollisionCars(heroBounds: Bounds) {
    for (const { sprite } of cars) {
      const carBounds = sprite.getBounds()
      if (checkCollisionOneCar(heroBounds, carBounds)) return true

    }
    return false
}

