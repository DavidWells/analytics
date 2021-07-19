import { inBrowser } from './inBrowser'

/**
 * @returns {string | undefined}
 */
export function getBrowserLocale() {
  if (!inBrowser) return
  const { language, languages, userLanguage } = navigator
  if (userLanguage) return userLanguage // IE only
  return (languages && languages.length) ? languages[0] : language
}
