import { Application, Assets, Container, Sprite, Ticker } from 'pixi.js'

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
const carConfig = {
  car01: { alias: 'car01', src: 'cars/car01.png', speed: 2 + Math.random() * 2 },
  car02: { alias: 'car02', src: 'cars/car02.png', speed: 2 + Math.random() * 2 },
  car03: { alias: 'car03', src: 'cars/car03.png', speed: 2 + Math.random() * 2 },
}

type Car = {
  alias: CarAlias
  sprite: Sprite
}

const cars: Car[] = []

export async function preloadCarAssets() {
  // Load the assets defined above.
  await Assets.load(Object.values(carConfig))
}

export function addCars(app: Application) {
  // Create a container to hold all the car sprites.
  const carContainer = new Container()

  // Add the car container to the stage.
  app.stage.addChild(carContainer)

  const carCount = 5
  const carAssets: CarAlias[] = ['car01', 'car02', 'car03']

  // Create a car sprite for each car.
  for (let i = 0; i < carCount; i++) {
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
    car.x = 100 + 100 * i
    car.y = Math.random() * 100 + 200

    // Randomly scale the car sprite to create some variety.
    car.scale.set(0.6)

    // Add the car sprite to the car container.
    carContainer.addChild(car)

    // Add the car sprite to the car array.
    cars.push({ alias: carAsset, sprite: car })
  }
}

export function animateCars(app: Application, speed: number, time: Ticker) {
  // Extract the delta time from the Ticker object.
  // const delta = time.deltaTime;

  // Define the padding around the stage where cares are considered out of sight.
  const stagePadding = 100
  const boundWidth = app.screen.width + stagePadding * 2
  const boundHeight = app.screen.height + stagePadding * 2

  // Iterate through each car sprite.
  cars.forEach(({ sprite, alias }) => {
    // Animate the car movement direction according to the turn speed.

    // Animate the car position according to the direction and speed.
    let deltaSpeed = -carConfig[alias].speed + speed * 0.1
    sprite.y += deltaSpeed

    // Wrap the car position when it goes out of bounds.
    if (sprite.x < -stagePadding) {
      sprite.x += boundWidth
    }
    if (sprite.x > app.screen.width + stagePadding) {
      sprite.x -= boundWidth
    }
    if (sprite.y < -stagePadding) {
      sprite.y += boundHeight
    }
    if (sprite.y > app.screen.height + stagePadding) {
      sprite.y -= boundHeight
    }
  })
}
