
/*
	Input > "Bought%20keyword
	Output > "Bought keyword"
 */
export default function decode(s) {
  return decodeURIComponent(s).replace(/\+/g, ' ')
}