import { Application, Assets, Container, Sprite, Ticker } from "pixi.js";

const cars: Sprite[] = [];

export async function preloadCarAssets() {
  // Create an array of asset data to load.
  const assets = [
    { alias: "car01", src: "cars/car01.png" },
    { alias: "car02", src: "cars/car02.png" },
    { alias: "car03", src: "cars/car03.png" },
  ];
  // Load the assets defined above.
  await Assets.load(assets);
}

export function addCars(app: Application) {
  // Create a container to hold all the car sprites.
  const carContainer = new Container();

  // Add the car container to the stage.
  app.stage.addChild(carContainer);

  const carCount = 5;
  const carAssets = ["car01", "car02", "car03"];

  // Create a car sprite for each car.
  for (let i = 0; i < carCount; i++) {
    // Cycle through the car assets for each sprite.
    const carAsset = carAssets[i % carAssets.length];

    // Create a car sprite.
    const car = Sprite.from(carAsset);

    // Center the sprite anchor.
    car.anchor.set(0.5);

    // Assign additional properties for the animation.
    car.speed = 2 + Math.random() * 2;

    // Randomly position the car sprite around the stage.
    car.x = 100 + 100 * i;
    car.y = Math.random() * 100 + 200;

    // Randomly scale the car sprite to create some variety.
    car.scale.set(0.6);

    // Add the car sprite to the car container.
    carContainer.addChild(car);

    // Add the car sprite to the car array.
    cars.push(car);
  }
}

export function animateCars(app: Application, speed: number, time: Ticker) {
  // Extract the delta time from the Ticker object.
  // const delta = time.deltaTime;

  // Define the padding around the stage where cares are considered out of sight.
  const stagePadding = 100;
  const boundWidth = app.screen.width + stagePadding * 2;
  const boundHeight = app.screen.height + stagePadding * 2;

  // Iterate through each car sprite.
  cars.forEach((car) => {
    // Animate the car movement direction according to the turn speed.

    // Animate the car position according to the direction and speed.
    let deltaSpeed = - car.speed + speed * 0.1;
    car.y += deltaSpeed;

    // Wrap the car position when it goes out of bounds.
    if (car.x < -stagePadding) {
      car.x += boundWidth;
    }
    if (car.x > app.screen.width + stagePadding) {
      car.x -= boundWidth;
    }
    if (car.y < -stagePadding) {
      car.y += boundHeight;
    }
    if (car.y > app.screen.height + stagePadding) {
      car.y -= boundHeight;
    }
  });
}