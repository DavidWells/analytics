/**
 * Example of plugin leveraging lifecycle hooks
 */

export default {
  name: 'lifecycle-example',
  bootstrap: ({ abort, config, instance }) => {
    instance.on('pageStart', () => { // <== disabled b/c action fires after 'page' & 'pageEnd'
      console.log('on("pageStart") handler')
    })
    instance.on('page', () => {
      console.log('on("page") handler')
    })
    instance.on('pageStart:lifecycle-example', () => {
      console.log('on("pageStart:lifecycle-example") handler')
    })
    instance.on('pageEnd', () => {
      console.log('on("pageEnd") handler')
    })
    instance.on('pageEnd:lifecycle-example', () => {
      console.log('on("pageEnd:lifecycle-example") handler')
    })
  },
  pageStart: ({ abort, payload, config }) => {
    console.log('pageStart')
  },
  page: ({ payload, config }) => {
    console.log('page')
  },
  pageEnd: ({ payload, config }) => {
    console.log('pageEnd')
  },
  identifyStart: ({ abort, payload, config }) => {
    console.log('identifyStart')
  },
  identify: ({ payload, config }) => {
    console.log('identify')
  },
  identifyEnd: ({ payload, config }) => {
    console.log('identifyEnd')
  },
  trackStart: ({ abort, payload, config }) => {
    console.log('trackStart')
  },
  track: ({ payload, config }) => {
    console.log('track')
  },
  trackEnd: ({ payload, config }) => {
    console.log('trackEnd')
  }
}
