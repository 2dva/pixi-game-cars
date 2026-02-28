// export const APP_VERSION = import.meta.env.VITE_APP_VERSION
// export const APP_VERSION = window.__APP_VERSION__
export const APP_VERSION = process.env.VITE_APP_VERSION_PUBLIC
export const APP_BACKGROUND = 0x545457
export const TOP_SPEED = 150

const APP_WIDTH = 740
const APP_HEIGHT = 600
const STAGE_PADDING = 120

const ROAD_LEFT_GAP = 60
const ROAD_LANE_COUNT = 5
const ROAD_LANE_WIDTH = 100
const SIDEWALK_WIDTH = 80

const isDevPlatform = process.env.NODE_ENV === 'development'
const isLocalPlatform = window.location.hostname.indexOf('localhost') > -1

export const gameConfig = {
  appWidth: APP_WIDTH,
  appHeight: APP_HEIGHT,
  stagePadding: STAGE_PADDING,

  roadLaneCount: ROAD_LANE_COUNT,
  roadLaneWidth: ROAD_LANE_WIDTH,
  roadLeftGap: ROAD_LEFT_GAP,
  roadSidewalkWidth: SIDEWALK_WIDTH,

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