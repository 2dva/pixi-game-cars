// Chances: 1 of n, returns number in range [0, n-1] 
export function rollDice(n: number) {
  return Math.floor(Math.random() * n)
}

// Chances: 1 of n
export function rollDiceBool(n: number) {
  return Math.floor(Math.random() * n) === n - 1
}

export function formatDistance(distance: number, pad: number = 0) {
  return (Math.floor(distance / 10) / 100).toFixed(1).padStart(pad, '0')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let inThrottle = false,
    trailingCall = false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
        if (trailingCall) func.apply(this, args)
        trailingCall = false
      }, wait)
      trailingCall = false
      func.apply(this, args)
    } else {
      trailingCall = true
    }
  }
}

export type TemplateData = Record<string, string | number>
export const applyTemplate = (str: string, obj: TemplateData) => {
  return str.replace(/\${([^}]+)}/g, (_, prop) => String(obj[prop]))
}

export function checkDeviceIsMobile() {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i, /Mobi/i]

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem)
  })
}

export function checkDeviceIsTouch() {
  return matchMedia('(hover: none), (pointer: coarse)').matches
}

// Возвращает функцию, которая отсчитывает расстояние и запускает callback каждые n метров
export function useRunEverySegment(segmentSizeInMeters = 10.0) {
  let elapsedDistance = 0.0
  let distanceSegments = 0

  return (deltaDistance: number, cb: (segments: number) => void) => {
    elapsedDistance += deltaDistance
    if (elapsedDistance < segmentSizeInMeters) return
    elapsedDistance -= segmentSizeInMeters
    distanceSegments++
    cb(distanceSegments)
  }
}

export type RunEverySegment = ReturnType<typeof useRunEverySegment>
