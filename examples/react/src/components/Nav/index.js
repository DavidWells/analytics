import React, { Component } from 'react'
import { Link } from "@reach/router"

export default class Nav extends Component {
  render() {
    return (
      <div className="navigation">
        <Link to='/'>Home</Link>
        <Link to='/one'>One</Link>
        <Link to='/two'>Two</Link>
        <Link to='/three'>Three</Link>
      </div>
    )
  }
}
