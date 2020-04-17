import inBrowser from './inBrowser'
import inReactNative from './inReactNative'

export default function getBrowserLocale() {
  if (!inBrowser || inReactNative) return null
  const { language, languages, userLanguage } = navigator
  if (languages && languages.length) {
    // latest versions of Chrome and Firefox set this correctly
    return languages[0]
  }
  // IE only
  if (userLanguage) {
    return userLanguage
  }
  // latest versions of Chrome, Firefox, and Safari set this correctly
  return language
}
