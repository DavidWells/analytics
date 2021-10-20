/**
 * Prepares an object for inclusion in endpoint data or event data.
 *
 * @param {Object} attributes
 * @param {Boolean} asArray If true ensure an array of strings is returned for each property
 */
 export async function prepareAttributes(attributes, asArray = false) {
  const sanitized = {}
  for (const name in attributes) {
    const value = Array.isArray(attributes[name])
      ? attributes[name]
      : [attributes[name]]
    const prepValue = asArray ? value : value[0]
    // console.log(`name ${name}`, prepValue)
    const data = await prepareData(prepValue, sanitizeAttribute)
    /* Remove any null/undefined values */
    if (!isNullOrUndef(data)) {
      sanitized[name] = data
    }
  }
  return sanitized
}

/**
 * Prepares an object for inclusion in endpoint data or event data.
 *
 * @param {Object} metrics
 */
export async function prepareMetrics(metrics) {
  const sanitized = {}
  for (const name in metrics) {
    sanitized[name] = await prepareData(metrics[name], sanitizeMetric)
  }
  return sanitized
}

/**
 * Resolves an attribute or metric value and sanitize it.
 *
 * @param {mixed} value
 * @param {Function} sanitizeCallback
 */
async function prepareData(value, sanitizeCallback) {
  if (typeof value === 'function') {
    value = await value()
  }
  return sanitizeCallback(value)
}

/**
 * Ensure value is a string or array of strings.
 *
 * @param {mixed} value
 */
function sanitizeAttribute(value) {
  // If null or undefined
  if (value == null) return
  if (Array.isArray(value)) {
    return value.filter(notEmpty).map((val) => val.toString())
  }
  // @TODO guard against null here
  return isNullOrUndef(value) ? value : value.toString()
}

/**
 * Ensure value is a single float.
 *
 * @param {mixed} value
 */
function sanitizeMetric(value) {
  return parseFloat(Number(Array.isArray(value) ? value[0] : value))
}

function notEmpty(val) {
  return val !== null && typeof val !== 'undefined'
}

function isNullOrUndef(value) {
  return value == null
}
