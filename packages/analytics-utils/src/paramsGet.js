import decodeUri from './decodeUri'

export default function getValueParamValue(name, string) {
  return decodeUri((RegExp(`${name}=(.+?)(&|$)`).exec(string) || [, ''])[1])
}
