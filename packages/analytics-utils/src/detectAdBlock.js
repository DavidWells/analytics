import { isBrowser } from '@analytics/type-utils'

/** 
 * Determine if Adblock is installed
 *
 * @returns boolean
 */
export function hasAdblock() {
  if (!isBrowser) return false
  // Create fake ad
  const fakeAd = document.createElement('div')
  fakeAd.innerHTML = '&nbsp;'
  fakeAd.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links'
  fakeAd.style = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;'
  try {
    // insert into page
    document.body.appendChild(fakeAd)
    if (
      document.body.getAttribute('abp') !== null ||
      fakeAd.offsetHeight === 0 ||
      fakeAd.clientHeight === 0
    ) {
      return true
    }
    if (typeof getComputedStyle !== 'undefined') {
      const css = window.getComputedStyle(fakeAd, null)
      if (css && (css.getPropertyValue('display') === 'none' || css.getPropertyValue('visibility') === 'hidden')) {
        return true
      }
    }
    // remove from page
    document.body.removeChild(fakeAd)
  } catch (e) {
    // swallow errors
  }
  return false
}
