export default function formatPayload(eventName, payload) {
  let data = {}
  if (typeof eventName === 'object') {
    data = eventName
  } else if (typeof payload === 'object') {
    data = payload
  }
  return data
}
