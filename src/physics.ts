import type { ControllerState } from './Controller'
import { checkCollisionWithCar, checkObstacleAhead } from './collision'
import { TOP_SPEED } from './configuration'
import type { State } from './state'
import { type BoundsLike } from './types'

function calculateHeroOffset(delta: number, speed: number) {
  return delta * ((speed * 12) / (speed * 10 + 200))
}

function calculateDistanceBySpeed(speed: number) {
  return speed * 0.01
}

export function calculateNextMove(
  state: State,
  controllerState: ControllerState,
  heroBounds: BoundsLike,
  carBounds: Map<number, BoundsLike>
) {
  let { speed, distance } = state
  const { keyUp, keyDown, keyLeft, keyRight, keySpace } = controllerState

  // Проверяем препятствие впереди перед изменением скорости
  let obstacleAhead = false

  for (const bound of carBounds.values()) {
    if (checkObstacleAhead(heroBounds, bound)) {
      obstacleAhead = true
      break
    }
  }

  let deltaX = 0
  if (keyRight) deltaX = 3
  if (keyLeft) deltaX = -3

  // Если препятствие впереди, не позволяем увеличивать скорость
  let deltaSpeed = 0
  if (!obstacleAhead && keyUp) deltaSpeed = 1
  if (keyDown) deltaSpeed = -1.3 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
  if (keySpace) deltaSpeed = -2.5 * (speed > 25 ? Math.sqrt(speed) / 5 : 1)
  speed += Math.floor(deltaSpeed)

  // Если препятствие впереди, снижаем скорость
  if (obstacleAhead) {
    speed -= 15
  }

  // Проверка чтобы не выйти за границу скорости
  speed = Math.min(Math.max(speed, 0), TOP_SPEED)

  const offsetX = calculateHeroOffset(deltaX, speed)

  const heroBoundsWithShift = {
    left: heroBounds.left + offsetX,
    right: heroBounds.right + offsetX,
    top: heroBounds.top,
    bottom: heroBounds.bottom,
  }

  let collision = null,
    crash = false
  for (const [lane, bound] of carBounds) {
    collision = checkCollisionWithCar(heroBoundsWithShift, bound, lane)
    if (collision !== null) {
      crash = true
      break // TODO: collect all collisions
    }
  }

  if (crash) deltaX = deltaX * 0.6
  const deltaDistance = calculateDistanceBySpeed(speed)
  distance += deltaDistance

  Object.assign(state, {
    speed,
    deltaSpeed,
    distance,
    deltaDistance,
    deltaX,
    crash,
  })

  return collision
}
