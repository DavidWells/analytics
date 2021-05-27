import getOs from './get-os'

const BRAVE = 'Brave'

export default function browserClientInfo() {
  if (typeof window === 'undefined') {
    return {}
  }

  if (!window.navigator) {
    return {}
  }
  const { platform, product, vendor, userAgent } = window.navigator
  const { type, version } = browserType(window.navigator)
  const vender = (type === BRAVE) ? type : (vendor || '').split(' ')[0]
  return {
    platform,
    os: getOs(),
    make: vender || product, // product always gecko
    model: type,
    version: version,
    name: [type, version].join('/'),
    language: getLanguage(),
    timezone: browserTimezone(),
  }
}

function getLanguage() {
  const { language, browserLanguage, languages } = window.navigator
  return (language || browserLanguage || (languages || ['en_US'])[0]).toLowerCase().replace('-', '_')
}

export function dimension() {
  if (typeof window === 'undefined') {
    return {
      width: 320,
      height: 320
    }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function browserTimezone() {
  const tzMatch = /\(([A-Za-z\s].*)\)/.exec(new Date().toString())
  return tzMatch ? tzMatch[1] || '' : ''
}

function browserType(navigator) {
  const { userAgent } = navigator
  const operaMatch = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9\.]+).*/i.exec(userAgent)
  if (operaMatch) {
    return {
      type: operaMatch[1],
      version: operaMatch[2]
    }
  }

  const ieMatch = /.+(Trident|Edge)\/([0-9\.]+).*/i.exec(userAgent)
  if (ieMatch) {
    return {
      type: ieMatch[1],
      version: ieMatch[2]
    }
  }

  // headless chrome
  const headless = /(headlesschrome)(?:\/([\w\.]+)| )/i.exec(userAgent)
  if (headless) {
    return {
      type: headless[1],
      version: headless[2]
    }
  }

  const chromeMatch = /.+(Chrome|Firefox|FxiOS)\/([0-9\.]+).*/i.exec(userAgent)
  if (chromeMatch) {
    const isBrave = (navigator.brave && navigator.brave.isBrave || false)
    return {
      type: (isBrave) ? BRAVE : chromeMatch[1],
      version: chromeMatch[2]
    }
  }

  const safariMatch = /.+(Safari)\/([0-9\.]+).*/i.exec(userAgent)
  if (safariMatch) {
    return {
      type: safariMatch[1],
      version: safariMatch[2]
    }
  }

  const webkitMatch = /.+(AppleWebKit)\/([0-9\.]+).*/i.exec(userAgent)
  if (webkitMatch) {
    return {
      type: webkitMatch[1],
      version: webkitMatch[2]
    }
  }

  const anyMatch = /.*([A-Z]+)\/([0-9\.]+).*/i.exec(userAgent)
  const fallback = anyMatch || ['', 'NA', '0.0.0']
  return {
    type: fallback[1],
    version: fallback[2]
  }
}