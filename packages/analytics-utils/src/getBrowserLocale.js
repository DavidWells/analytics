import { isBrowser } from '@analytics/type-utils'

/**
 * @returns {string | undefined}
 */
export function getBrowserLocale() {
  if (!isBrowser) return
  const { language, languages, userLanguage } = navigator
  if (userLanguage) return userLanguage // IE only
  return (languages && languages.length) ? languages[0] : language
}
