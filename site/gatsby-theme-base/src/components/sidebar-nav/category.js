import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import styled from '@emotion/styled'
import {Link} from 'gatsby'
import {MdExpandLess, MdExpandMore} from 'react-icons/md'
import {colors} from '../../utils/colors'
import {smallCaps} from '../../utils/typography'

const iconSize = 20
const headingPadding = 16
const headingStyles = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginBottom: 0,
  padding: headingPadding,
  paddingLeft: 0,
  border: 0,
  color: colors.text2,
  background: 'none',
  outline: 'none',
  h6: {
    margin: 0,
    fontWeight: 'bold',
    ...smallCaps,
    color: 'inherit'
  },
  svg: {
    display: 'block',
    width: iconSize,
    height: iconSize,
    marginLeft: 'auto',
    fill: 'currentColor'
  },
  '&.active': {
    color: colors.primary
  }
}

const Container = styled.div(props => ({
  borderTop: !props.first && `1px solid ${colors.divider}`,
  marginTop: props.first && headingPadding / -2
}))

const StyledButton = styled.button(headingStyles, {
  ':not([disabled])': {
    cursor: 'pointer',
    ':hover': {
      opacity: colors.hoverOpacity
    }
  }
})

const StyledLink = styled(Link)(headingStyles, {
  textDecoration: 'none'
})

export default class Category extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    path: PropTypes.string,
    expanded: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    isFirst: PropTypes.bool.isRequired,
    onClick: PropTypes.func
  };

  onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.title)
    }
  };

  renderContents() {
    const Icon = this.props.expanded ? MdExpandLess : MdExpandMore
    return (
      <Fragment>
        <h6>{this.props.title}</h6>
        <Icon
          style={{
            visibility: this.props.onClick ? 'visible' : 'hidden'
          }}
        />
      </Fragment>
    )
  }

  render() {
    const contents = this.renderContents()
    const className = this.props.active && 'active'
    return (
      <Container first={this.props.isFirst}>
        {!this.props.onClick && this.props.path ? (
          <StyledLink className={className} to={this.props.path}>
            {contents}
          </StyledLink>
        ) : (
          <StyledButton className={className} onClick={this.onClick}>
            {contents}
          </StyledButton>
        )}
        {this.props.expanded && this.props.children}
      </Container>
    )
  }
}
