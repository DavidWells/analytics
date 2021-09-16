export default function getEventName(key, eventMap = {}) {
  return eventMap[key] || key
}
