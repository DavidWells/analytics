/**
 * Convert DOM node list to array
 * @param  {nodeList} obj - DOM node list
 * @return {array} array of nodes
 */
export default function toArray(obj) {
  const array = []
  // iterate backwards ensuring that length is an UInt32
  for (var i = obj.length >>> 0; i--;) {
    array[i] = obj[i]
  }
  return array
}
