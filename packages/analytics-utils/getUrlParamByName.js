
export default function getValueParamValue(name, string) {
  return (RegExp(`${name}=(.+?)(&|$)`).exec(string) || [, false])[1]
}
