
/**
 * @returns {string | undefined}
 */
export default function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {}
}
