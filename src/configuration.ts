// export const APP_VERSION = import.meta.env.VITE_APP_VERSION
// export const APP_VERSION = window.__APP_VERSION__
export const APP_VERSION = process.env.VITE_APP_VERSION_PUBLIC
export const APP_BACKGROUND = 0x545457
export const APP_WIDTH = 740
export const APP_HEIGHT = 600

export const STAGE_PADDING = 120

export const ROAD_LEFT_GAP = 60
export const ROAD_LANE_COUNT = 5
export const ROAD_LANE_WIDTH = 100
export const SIDEWALK_WIDTH = 80

export const TOP_SPEED = 150

const isDevPlatform = process.env.NODE_ENV === 'development'
const isLocalPlatform = window.location.hostname.indexOf('localhost') > -1

export const gameConfiguration = {
  isDevPlatform,
  isLocalPlatform,
}

export const zIndexFixed = {
  road: 1,
  groundObjects: 2,
  cars: 3,
  flyingObjects: 4,
  hud: 5,
  infoScreens: 6,
}