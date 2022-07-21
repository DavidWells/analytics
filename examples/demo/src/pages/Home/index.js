import React, { Component } from 'react'
import { Link } from "@reach/router"
import { initialHistory } from '../../utils/analytics/plugins/visualize-analytics'
import analytics from '../../utils/analytics'
import Navigation from '../../fragments/Nav'
import Log from '../../components/Log'
import './Home.css'

let hasCleared = false

// analytics.ready((info) => {
//   console.log('info', info)
//   analytics.plugins['google-analytics'].addTag('foobar')
// })

function sortByTimeStamp(a, b) {
  if (!a.meta || !b.meta) {
    return 0
  }
  // console.log('a.meta.ts', a.meta)
  // console.log('b.meta.ts', b.meta)
  if (a.meta.ts < b.meta.ts) {
    return -1
  }
  if (a.meta.ts > b.meta.ts) {
    return 1
  }
  return 0
}

if (typeof window.__global__.analytics === 'undefined') {
  window.__global__.analytics = []
}

export default class App extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      history: window.__global__.analytics
    }
  }
  componentDidMount() {
    this.listener = analytics.on('*', ({ payload }) => {
      console.log('payload', payload)
      this.setState({
        history: window.__global__.analytics.concat(payload) // .sort(sortByTimeStamp)
      })
    })
    setInterval(() => {
      this.setState({
        history:  window.__global__.analytics // .sort(sortByTimeStamp)
      })
    }, 1000);

    analytics.ready(() => {
      console.log('analytics.ready fired')
    })

    analytics.on('page:segment', ({ payload }) => {
      console.log('analytics.on page:segment')
    })

    analytics.on('page', ({ payload }) => {
      console.log('PAGE', payload)
    })

    analytics.on('setOriginalSource', ({ payload }) => {
      console.log('payload', payload)
    })
    // analytics.on('reset', ({ payload }) => {
    //   alert('middle reset')
    // })
    //
    // analytics.on('resetStart', ({ payload }) => {
    //   alert('start reset')
    // })
    //
    // analytics.on('resetEnd', ({ payload }) => {
    //   alert('end reset')
    // })
  }
  componentWillUnmount() {
    this.listener()
  }
  // Clear logs for demo buttons
  clearLogs() {
    if (!hasCleared) {
       window.__global__.analytics = []
      hasCleared = true
    }
  }
  doPage = async () => {
    this.clearLogs()
    analytics.page(() => {
      console.log('page callback doPage')
    })
    console.log('Page async fire this after')
  }
  doTrack = async () => {
    this.clearLogs()
    analytics.track('buttonClicked', {
      foo: 'bar',
      baz: 'cool'
    }, (lol) => {
      console.log('track callback', lol)
    }).then((what) => {
      console.log('promises work!', what)
    })
    console.log('other thing')
  }
  doIdentify = () => {
    this.clearLogs()
    analytics.identify('xyz-777', {
     traitOne: 'blue',
     traitTwo: 'red',
     companyName: 'lol corp',
     testing_value: 'hi',
     // first_name: 'steve',
     // lastName: 'john'
   }, () => {
     console.log('identify callback')
   })
  }
  render() {
    const { history } = this.state
    return (
      <div className="App">
        <Navigation />
        <h2>
          <a href='https://github.com/DavidWells/analytics'>Analytics</a>
          <span className="install">npm install analytics</span>
        </h2>

        <div className="about">
          <p>
            Lightweight, extendable, framework agnostic, analytics library designed to work with any third party analytics provider to <b>track page views</b>, <b>custom events</b>, & <b>identify users</b>.
          </p>
          <div className='example-buttons'>
            <div className='try-it'>Try it &nbsp;&nbsp;👉</div>
            <button onClick={this.doPage} title='Fire a page view'>
              {`analytics.page()`}
            </button>
            <button onClick={this.doTrack} title='Track an event'>
              {`analytics.track()`}
            </button>
            <button onClick={this.doIdentify} title='Identify a visitor'>
              {`analytics.identify()`}
            </button>
          </div>
        </div>
        <div className="about">
          <p>
            Analytics acts as an abstraction layer on top of third party analytic tools making it easy to add or remove tools as business requirements change.
          </p>
          <p>It runs off a lifecycle of events that can be hooked into via <a href='https://getanalytics.io/plugins/writing-plugins/' target='_blank' rel='noopener noreferrer'>
            plugins
          </a> & listeners. This makes calls to third party analytic tools completely customizable & cancellable.
          </p>
        </div>
        <Log items={history} />
      </div>
    )
  }
}
