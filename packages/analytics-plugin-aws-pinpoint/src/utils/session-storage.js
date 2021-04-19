import inBrowser from './in-browser'

function isSessionStorageSupported() {
  if (!inBrowser) return false
	const sessionStorage = window.sessionStorage;
	try {
		sessionStorage.setItem('__test', 'x')
		sessionStorage.removeItem('__test')
		return true
	} catch (e) {
		return false
	}
}

const hasSessionStorage = isSessionStorageSupported()

export default hasSessionStorage