import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import {Link} from 'gatsby'
import {colors} from 'gatsby-theme-base'
import {darken, transparentize} from 'polished'

export const ButtonWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-evenly',
  width: '100%',
  maxWidth: 640,
  margin: '0 auto',
  marginBottom: 24
})

function getButtonShadow(state) {
  const isFocused = state === 'focused'
  return [
    state === 'active'
      ? `inset 0 2px 2px 0 ${transparentize(0.88, colors.shadow)}`
      : `0 1px 4px 0 ${transparentize(0.92, colors.shadow)}`,
    `inset 0 -1px 0 0 ${transparentize(0.95, colors.shadow)}`,
    isFocused && `0 0 0 2px ${colors.highlight2}`,
    `inset 0 0 0 1px ${
      isFocused ? colors.highlight : transparentize(0.8, colors.shadow)
    }`
  ]
    .filter(Boolean)
    .toString()
}

const baseButtonStyles = {
  border: 'none',
  borderRadius: 4,
  lineHeight: 'calc(1em + 1px)',
  fontWeight: 600,
  letterSpacing: '0.02em',
  outline: 'none',
  cursor: 'pointer',
  transitionProperty: 'background-color, box-shadow',
  transitionDuration: '200ms',
  transitionTimingFunction: 'ease-out'
}

function getStylesForVariant(variant, color) {
  const isBranded = color === 'branded'
  switch (variant) {
    case 'hidden':
      return {
        color: isBranded ? colors.highlight : colors.text2,
        background: 'none',
        ':active': {
          backgroundColor: isBranded ? colors.highlight2 : colors.background2
        },
        ':not(:active)': {
          ':hover': {
            backgroundColor: isBranded ? colors.highlight3 : colors.background
          },
          ':focus': {
            boxShadow: getButtonShadow('focused'),
            backgroundColor: 'white'
          }
        }
      }
    default: {
      const backgroundColor = isBranded ? colors.primary : colors.background2
      return {
        color: isBranded ? 'white' : colors.text2,
        backgroundColor,
        boxShadow: getButtonShadow(),
        ':active': {
          boxShadow: getButtonShadow('active')
        },
        ':focus': {
          boxShadow: getButtonShadow('focused')
        },
        ':not(:active):hover': {
          backgroundColor: darken(0.05, backgroundColor)
        }
      }
    }
  }
}

function getStylesForSize(size) {
  switch (size) {
    case 'large':
      return {
        minWidth: 112,
        padding: '12px 24px',
        fontSize: 17
      }
    case 'small':
      return {
        minWidth: 80,
        padding: '8px 16px',
        fontSize: 13
      }
    default:
      return {
        minWidth: 100,
        padding: '10px 20px',
        fontSize: 15
      }
  }
}

export function getButtonStyles(props) {
  return {
    ...baseButtonStyles,
    ...getStylesForSize(props.size),
    ...getStylesForVariant(props.variant, props.color)
  }
}

export const Button = styled.button(getButtonStyles)

Button.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['standard', 'branded']),
  variant: PropTypes.oneOf(['standard', 'hidden'])
}

Button.defaultProps = {
  size: 'medium',
  color: 'standard',
  variant: 'standard'
}

export const ButtonLink = styled(Link)(getButtonStyles, {
  textDecoration: 'none'
})

ButtonLink.propTypes = Button.propTypes
ButtonLink.defaultProps = Button.defaultProps
