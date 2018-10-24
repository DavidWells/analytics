import isInBrowser from './isInBrowser'

export default function removeUTMFromUrl () {
  if (isInBrowser) {
    const { history, location } = window
    if (location.search.indexOf('utm_') !== -1 && history && history.replaceState) {
      const cleanURL = location.toString().replace(/(\&|\?)utm([_a-z0-9=\.]+)/g, '')
      history.replaceState({}, '', cleanURL)
    }
  }
}
