export {} // This makes the file a module

declare global {
  interface Window {
    __APP_VERSION__: string // Define the property and its type
  }
}
