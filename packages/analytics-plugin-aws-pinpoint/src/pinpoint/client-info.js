export default function browserClientInfo() {
	if (typeof window === 'undefined') {
    return {}
  }

	if (!window.navigator) {
    return {}
  }

	const { platform, product, vendor, userAgent } = window.navigator
	const type = browserType(userAgent)

	return {
		platform,
		make: vendor || product,
		model: type.type,
		version: type.version,
		appVersion: [type.type, type.version].join('/'),
		language: getLanguage(),
		timezone: browserTimezone(),
	}
}

function getLanguage() {
  const { language, browserLanguage, languages } = window.navigator
  return (language || browserLanguage || (languages || ['en_US'])[0]).toLowerCase().replace( '-', '_' )
}

export function dimension() {
	if (typeof window === 'undefined') {
		return { width: 320, height: 320 }
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

function browserType(userAgent) {
	const operaMatch = /.+(Opera[\s[A-Z]*|OPR[\sA-Z]*)\/([0-9\.]+).*/i.exec(userAgent)
	if (operaMatch) {
		return { type: operaMatch[1], version: operaMatch[2] }
	}

	const ieMatch = /.+(Trident|Edge)\/([0-9\.]+).*/i.exec(userAgent)
	if (ieMatch) {
		return { type: ieMatch[1], version: ieMatch[2] }
	}

	const cfMatch = /.+(Chrome|Firefox|FxiOS)\/([0-9\.]+).*/i.exec(userAgent)
	if (cfMatch) {
		return { type: cfMatch[1], version: cfMatch[2] }
	}

	const sMatch = /.+(Safari)\/([0-9\.]+).*/i.exec(userAgent)
	if (sMatch) {
		return { type: sMatch[1], version: sMatch[2] }
	}

	const awkMatch = /.+(AppleWebKit)\/([0-9\.]+).*/i.exec(userAgent)
	if (awkMatch) {
		return { type: awkMatch[1], version: awkMatch[2] }
	}

	const anyMatch = /.*([A-Z]+)\/([0-9\.]+).*/i.exec(userAgent)
	if (anyMatch) {
		return { type: anyMatch[1], version: anyMatch[2] }
	}

	return { type: '', version: '' }
}
