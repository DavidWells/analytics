import React, { Component } from 'react'
import { Link } from "@reach/router"
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

    this.pageListener = analytics.on('customEvent', ({ payload }) => {
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
        <div>
          <Link to='/'>Home</Link>
        </div>
        <h2>Listeners</h2>
        <p>You can listen to analytic events with the <code>analytics.on('event')</code></p>
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
          action={<button onClick={this.doTrack}>Track</button>}
          events={listenerHistory['trackStart']}
          code={outdent`
            analytics.on('trackStart', ({ payload }) => {
              console.log(\`trackStart listener \${payload.type}\`)
            })
          `}
        />

        <Demo
          title='Page listener'
          action={<button onClick={this.doPage}>Page</button>}
          events={listenerHistory['page']}
          code={outdent`
            analytics.on('page', ({ payload }) => {
              console.log(\`page listener \${payload.type}\`)
            })
          `}
        />

        <Demo
          title='customEvent listener'
          action={<button onClick={this.doCustomEvent}>CustomEvent</button>}
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
