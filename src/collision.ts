import type { Bounds } from 'pixi.js'

export type BoundsLike = Partial<Bounds> & Pick<Bounds, 'left' | 'right' | 'top' | 'bottom'>
export type CollisionDirection = 'head' | 'back' | 'left' | 'right'
export type CollisionObject = {
  direction: CollisionDirection
  force: number
  damage: number
  speedLoss: number
  recoil: [number, number]
}

export function checkCollisionWithObject(hero: BoundsLike, obj: BoundsLike): boolean {
  const rightmostLeft = hero.left < obj.left ? obj.left : hero.left
  const leftmostRight = hero.right > obj.right ? obj.right : hero.right
  if (leftmostRight < rightmostLeft) return false

  const bottommostTop = hero.top < obj.top ? obj.top : hero.top
  const topmostBottom = hero.bottom > obj.bottom ? obj.bottom : hero.bottom
  return topmostBottom > bottommostTop
}

export function checkCollisionWithCar(hero: BoundsLike, car: BoundsLike): CollisionObject | null {
  const amortization = 0.5
  const rightmostLeft = hero.left < car.left ? car.left : hero.left
  const leftmostRight = hero.right > car.right ? car.right : hero.right

  if (leftmostRight < rightmostLeft + amortization) {
    return null
  }

  let force = leftmostRight - rightmostLeft

  const bottommostTop = hero.top < car.top ? car.top : hero.top
  const topmostBottom = hero.bottom > car.bottom ? car.bottom : hero.bottom

  if (topmostBottom < bottommostTop + amortization) {
    return null
  }

  force = Math.min(force, topmostBottom - bottommostTop)
  const damage = Math.round(0.5 + force * 0.6)

  // we have collision here
  const collisionX: CollisionDirection = hero.left > car.left ? 'left' : 'right'
  const collisionY: CollisionDirection = hero.top > car.top ? 'head' : 'back'

  const direction: CollisionDirection =
    Math.abs(hero.left - car.left) * 2 < Math.abs(hero.top - car.top) ? collisionY : collisionX

  let speedLoss = 0
  let recoil: [number, number] = [0,0]
  switch (direction) {
    case 'head':
      speedLoss = -2
      recoil = [0, -4]
      break
    case 'back':
      speedLoss = 8
      recoil = [0, 4]
      break
    case 'left':
      speedLoss = 3
      recoil = [-4, 0]
      break
    case 'right':
      speedLoss = 3
      recoil = [4, 0]
      break
  }

  return { direction: direction, force, damage, speedLoss, recoil }
}

export function checkObstacleAhead(hero: BoundsLike, car: BoundsLike): boolean {
  // Проверяем, есть ли препятствие впереди от героя
  return car.right >= hero.left && car.left <= hero.right && car.bottom >= hero.top && car.top < hero.top
}
