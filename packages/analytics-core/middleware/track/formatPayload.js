export default function formatPayload(eventName, payload) {
  let data = {}
  if (typeof eventName === 'object') {
    data = eventName
  } else if (typeof payload === 'object') {
    data = payload
  }
  // why did I do this?
  // if (typeof eventName === 'string') {
  //   data.eventName = eventName
  // }
  return data
}
