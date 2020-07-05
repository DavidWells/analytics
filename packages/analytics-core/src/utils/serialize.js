export default function serialize(obj) {
  let s = obj
  try {
    s = JSON.parse(JSON.stringify(obj))
  } catch (err) {}
  return s
}
