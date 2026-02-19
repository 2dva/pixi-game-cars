export type State = {
  score: number
  speed: number
  deltaSpeed: number
  distance: number
  deltaDistance: number
  deltaX: number
  condition: number
  crash: boolean
  claim: boolean
}

export const defaultState: State = {
  score: 0,
  speed: 0,
  deltaSpeed: 0,
  distance: 0,
  deltaDistance: 0,
  deltaX: 0,
  condition: 100,
  crash: false,
  claim: false,
}
