
/**
 * @returns {string | undefined}
 */
export function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {}
}
