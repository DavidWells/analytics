/**
 * In browser context
 * @return {Boolean} true if in ReactNative
 */
export default typeof navigator != 'undefined' && navigator.product == 'ReactNative'
