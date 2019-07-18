import PropTypes from 'prop-types'
import { Component, createRef } from 'react'
import { findDOMNode } from 'react-dom'

export default class ResponsiveSidebar extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired
  };

  state = {
    sidebarOpen: false
  };

  sidebar = createRef();

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = event => {
    // close the sidebar when esc key is pressed
    if (this.state.sidebarOpen && event.keyCode === 27) {
      this.closeSidebar()
    }
  };

  onWrapperClick = event => {
    if (
      this.state.sidebarOpen &&
      // eslint-disable-next-line react/no-find-dom-node
      !findDOMNode(this.sidebar.current).contains(event.target)
    ) {
      this.closeSidebar()
    }
  };

  openSidebar = () => this.setState({sidebarOpen: true});

  closeSidebar = () => this.setState({sidebarOpen: false});

  render() {
    return this.props.children({
      sidebarOpen: this.state.sidebarOpen,
      openSidebar: this.openSidebar,
      onWrapperClick: this.onWrapperClick,
      sidebarRef: this.sidebar
    })
  }
}
