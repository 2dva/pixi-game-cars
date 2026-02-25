// Chance: 1 of n 
export function rollDice(n: number) {
  return Math.floor(Math.random() * n)
}

// Chance: 1 of n 
export function rollDiceBool(n: number) {
  return Math.floor(Math.random() * n) === n - 1
}

export function formatDistance(distance: number, pad: number = 0) {
  return (Math.floor(distance / 10) / 100).toFixed(1).padStart(pad, '0')
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

export type TemplateData = Record<string, string | number>
export const applyTemplate = (str: string, obj: TemplateData) => {
  return str.replace(/\${([^}]+)}/g, (_, prop) => String(obj[prop]))
}
