import React, { Component } from 'react'
import Navigation from '../../fragments/Nav'
import outdent from 'outdent'
import Demo from './demo'
import analytics from '../../utils/analytics'

let listenerHistory = {
  '*': [],
  trackStart: [],
  page: [],
  customEvent: []
}
export default class Listeners extends Component {
  componentDidMount() {

    this.listener = analytics.on('*', ({ payload }) => {
      console.log(`* listener ${payload.type}`)
      listenerHistory['*'].push(payload)
      this.setState({
        historyAll: listenerHistory['*']
      })
    })

    this.trackListener = analytics.on('trackStart', ({ payload }) => {
      console.log(`trackStart listener ${payload.type}`)
      listenerHistory['trackStart'].push(payload)
      this.setState({
        historytrackStart: listenerHistory['trackStart']
      })
    })

    this.pageListener = analytics.on('page', ({ payload }) => {
      console.log(`page listener ${payload.type}`)
      listenerHistory['page'].push(payload)
      this.setState({
        historytrackStart: listenerHistory['page']
      })
    })

    this.customEventListener = analytics.on('customEvent', ({ payload }) => {
      console.log(`page listener ${payload.type}`)
      listenerHistory['customEvent'].push(payload)
      this.setState({
        historytrackStart: listenerHistory['customEvent']
      })
    })
  }
  componentWillUnmount() {
    this.listener()
    this.trackListener()
    this.pageListener()
    this.customEventListener()
  }

  doTrack = () => {
    analytics.track('trackItem', {
      foo: 'bar'
    })
  }
  doPage = () => {
    analytics.page()
  }

  doCustomEvent = () => {
    analytics.dispatch('customEvent')
  }

  render() {
    return (
      <div className="App">
        <Navigation />
        <h2>Listeners</h2>
        <p>You can listen to events happening within analytics with <code>analytics.on('event')</code>, <code>analytics.once('event')</code></p>
        <p>
          Read more about <a href="https://getanalytics.io/using-listeners/">using listeners in the docs</a>.
        </p>
        <p>
          Below are some examples of using listeners to fire custom callbacks when events happen.
        </p>
        <Demo
          title='Listen to everything via *'
          events={listenerHistory['*']}
          code={outdent`
            analytics.on('*', ({ payload }) => {
              console.log(\`* listener \${payload.type}\`)
            })
          `}
        />

        <Demo
          title='Track listener'
          action={<button onClick={this.doTrack}>Track Event</button>}
          events={listenerHistory['trackStart']}
          code={outdent`
            analytics.on('trackStart', ({ payload }) => {
              console.log(\`trackStart listener \${payload.type}\`)
            })
          `}
        />

        <Demo
          title='Page listener'
          action={<button onClick={this.doPage}>Track Page View</button>}
          events={listenerHistory['page']}
          code={outdent`
            analytics.on('page', ({ payload }) => {
              console.log(\`page listener \${payload.type}\`)
            })
          `}
        />

        <Demo
          title='customEvent listener'
          action={<button onClick={this.doCustomEvent}>Dispatch CustomEvent</button>}
          events={listenerHistory['customEvent']}
          code={outdent`
            analytics.on('customEvent', ({ payload }) => {
              console.log(\`customEvent listener \${payload.type}\`)
            })
          `}
        />
      </div>
    )
  }
}
