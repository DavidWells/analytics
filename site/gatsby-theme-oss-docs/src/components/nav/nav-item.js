import PropTypes from 'prop-types'
import React, {Fragment} from 'react'
import styled from '@emotion/styled'
import {boxShadow} from '../search'
import {colors} from 'gatsby-theme-base'
import {triangle} from 'polished'

const Subpages = styled.div({
  padding: '20px 24px',
  borderRadius: 4,
  border: `1px solid ${colors.divider}`,
  boxShadow,
  backgroundColor: 'white',
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)'
})

const SubpagesTriangle = styled.div(
  triangle({
    pointingDirection: 'top',
    width: 16,
    height: 8,
    foregroundColor: colors.divider
  }),
  {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)'
  }
)

const SubpagesTriangleInner = styled(SubpagesTriangle)({
  borderBottomColor: 'white',
  bottom: -2
})

const subpageElements = [Subpages, SubpagesTriangle, SubpagesTriangleInner]
const Container = styled.div(props => ({
  marginRight: 24,
  borderBottom: `2px solid ${props.active ? colors.secondary : 'transparent'}`,
  position: 'relative',
  ':last-child': {
    marginRight: 0,
    [Subpages]: {
      left: 'auto',
      right: 0,
      transform: 'none',
      '::before': {
        left: 'auto',
        right: 8,
        transform: 'none'
      }
    }
  },
  [subpageElements]: {
    opacity: 0,
    visibility: 'hidden',
    transitionProperty: 'opacity, visibility',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease-in-out'
  },
  ':hover': {
    zIndex: 1,
    [subpageElements]: {
      opacity: 1,
      visibility: 'visible'
    }
  }
}))

const StyledAnchor = styled.a({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '0 4px',
  fontSize: 18,
  color: colors.primary,
  textDecoration: 'none',
  ':hover': {
    opacity: colors.hoverOpacity
  }
})

const SubpageAnchor = styled.a({
  display: 'block',
  color: colors.text1,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  ':hover': {
    opacity: colors.hoverOpacity
  },
  ':not(:last-child)': {
    marginBottom: 8
  }
})

export default function NavItem(props) {
  return (
    <Container active={props.active}>
      <StyledAnchor href={props.href}>{props.children}</StyledAnchor>
      {props.subpages && (
        <Fragment>
          <Subpages>
            {props.subpages.map(({value, text}) => (
              <SubpageAnchor key={value} href={value}>
                {text}
              </SubpageAnchor>
            ))}
          </Subpages>
          <SubpagesTriangle />
          <SubpagesTriangleInner />
        </Fragment>
      )}
    </Container>
  )
}

NavItem.propTypes = {
  active: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
  subpages: PropTypes.array
}
