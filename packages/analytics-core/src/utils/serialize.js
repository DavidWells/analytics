export default function serialize(obj) {
  try {
   return JSON.parse(JSON.stringify(obj))
  } catch (err) {}
  return obj
}