import { h, Component } from 'preact'
import { route } from 'preact-router'

class Redirect extends Component {
  componentWillMount() {
    route(this.props.to, true)
  }

  render() {
    return null
  }
}

export default Redirect
