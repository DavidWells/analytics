export default function getBrowserOS(){
  if (typeof navigator === 'undefined') {
    return false
  }
  const os = navigator.appVersion
  if (os.indexOf("Win") !== -1) return "Windows"
  if (os.indexOf("Mac") !== -1) return "MacOS"
  if (os.indexOf("X11") !== -1) return "UNIX"
  if (os.indexOf("Linux") !== -1) return "Linux"
  // default
  return "Unknown OS"
}
