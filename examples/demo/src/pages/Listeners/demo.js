import React, { Component } from 'react'
import './demo.css'

export default class Demo extends React.Component {
  showLog = () => {
    const { events } = this.props
    return events.map((item, i) => {
      const event = Object.keys(item).reduce((acc, key) => {
        if (key === 'type') return acc
        acc[key] = item[key]
        return acc
      }, {})
      return (
        <div key={i} className='item'>
          <div className='event'>
            {item.type}
          </div>
          <div className='data'>
            {JSON.stringify(event)}
          </div>
        </div>
      )
    })
  }
  render() {
    const { code, title, action } = this.props
    return (
      <div className='demo-wrapper'>
        {title && <h3>{title}</h3>}
        {action}
        <div className='demo-split'>
          <div className='demo-code'>
            <pre>
              <code>
                {code}
              </code>
            </pre>
          </div>
          <div className='demo-log'>
            {this.showLog()}
          </div>
        </div>
      </div>
    )
  }
}
