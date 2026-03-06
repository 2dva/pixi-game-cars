export {} // This makes the file a module

declare global {
  interface Window {
    __APP_VERSION__: string
    __PIXI_DEVTOOLS__: object
  }
}
