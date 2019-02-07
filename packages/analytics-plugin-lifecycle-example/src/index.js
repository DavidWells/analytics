/**
 * Example of plugin leveraging lifecycle hooks
 */

export default {
  NAMESPACE: 'lifecycle-example',
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
  pageStart: ({ abort, config }) => {
    console.log('pageStart')
  },
  page: ({ abort, config }) => {
    console.log('page')
  },
  pageEnd: ({ abort, config }) => {
    console.log('pageEnd')
  },
  identifyStart: ({ abort, config }) => {
    console.log('identifyStart')
  },
  identify: ({ abort, config }) => {
    console.log('identify')
  },
  identifyEnd: ({ abort, config }) => {
    console.log('identifyEnd')
  },
  trackStart: ({ abort, config }) => {
    console.log('trackStart')
  },
  track: ({ abort, config }) => {
    console.log('track')
  },
  trackEnd: ({ abort, config }) => {
    console.log('trackEnd')
  }
}
