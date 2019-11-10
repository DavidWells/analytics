/**
 * Amplitude plugin
 * @link https://getanalytics.io/plugins/amplitude/
 * @link https://amplitude.com/
 * @link https://developers.amplitude.com
 * @param {object} pluginConfig - Plugin settings
 * @param {string} pluginConfig.apiKey - Amplitude project API key
 * @param {string} pluginConfig.options - Amplitude SDK options
 * @return {*}
 * @example
 *
 * amplitude({
 *   apiKey: 'token'
 * })
 */
export default function amplitude() {
	return {
		name: 'amplitude'
	}
}
