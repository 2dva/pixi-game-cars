import type { Ticker } from 'pixi.js'

export function rollDice(n: number) {
  return Math.floor(Math.random() * n)
}

export function rollBoolDice(n: number) {
  return Math.floor(Math.random() * n) === n - 1
}

let elapsedSeconds = 0.0
export function runEverySecond(ticker: Ticker, cb: () => void) {
  elapsedSeconds += ticker.elapsedMS
  if (elapsedSeconds < 1000.0) return
  elapsedSeconds -= 1000.0
  cb()
}

let elapsedDistance = 0.0
export function runEveryHundredMeters(deltaDistance: number, cb: () => void) {
  elapsedDistance += deltaDistance
  if (elapsedDistance < 100.0) return
  elapsedDistance -= 100.0
  cb()
}

export function calculateDistance(speed: number) {
  return speed * 0.01
}

const gears = [0, 25, 50, 85, 120]
export function calculateGear(speed: number) {
  let gear = 0
  while (speed > gears[gear]) gear++
  return gear ? String(gear) : 'P'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let inThrottle = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, wait)
      func.apply(this, args)
    }
  }
}