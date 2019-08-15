/* global docsearch */
import React, { Component, Fragment, createRef } from 'react'
import styled from '@emotion/styled'
import {MdClose} from 'react-icons/md'
import { navigate } from 'gatsby'
import {
  breakpoints,
  colors,
  headerHeight,
  smallCaps
} from 'gatsby-theme-base'
import { css } from '@emotion/core'
import { position, size, transparentize } from 'polished'
import analytics from '../analytics' // eslint-disable-line

const borderRadius = 5
const border = `1px solid ${colors.text3}`
const verticalAlign = css({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)'
})

const responsiveStyles = css({
  [breakpoints.lg]: {
    display: 'none'
  }
})

const Hotkey = styled.div(verticalAlign, size(24), {
  border,
  borderColor: colors.text4,
  color: colors.text4,
  borderRadius,
  textAlign: 'center',
  lineHeight: 1.125,
  right: 8,
  pointerEvents: 'none'
})

const boxShadowColor = transparentize(0.9, 'black')
export const boxShadow = `${boxShadowColor} 0 2px 12px`
const Container = styled.div(responsiveStyles, {
  flexGrow: 1,
  maxWidth: 480,
  marginLeft: 40,
  color: colors.text2,
  position: 'relative',
  zIndex: 1,
  '.algolia-autocomplete': {
    width: '100%',
    '.ds-dropdown-menu': {
      width: 648,
      marginTop: 14,
      borderRadius,
      boxShadow,
      '&::before': {
        display: 'none'
      },
      '[class^=ds-dataset-]': {
        maxHeight: `calc(100vh - ${headerHeight}px - 32px)`,
        padding: 0,
        border,
        borderRadius: 'inherit'
      },
      '.ds-suggestions': {
        marginTop: 0
      },
      '.ds-suggestion': {
        padding: '15px 32px',
        borderBottom: `1px solid ${colors.divider}`,
        '&.ds-cursor': {
          backgroundColor: transparentize(0.5, colors.divider)
        }
      }
    },
    '.algolia-docsearch-suggestion': {
      padding: 0,
      color: 'inherit',
      background: 'none',
      textDecoration: 'none',
      [['&--wrapper', '&--subcategory-column', '&--content']]: {
        width: 'auto',
        float: 'none'
      },
      '&--wrapper': {
        paddingTop: 0
      },
      '&--category-header': {
        marginTop: 0,
        marginBottom: 4,
        borderBottom: 0,
        fontSize: 14,
        color: 'inherit',
        ...smallCaps
      },
      [['&--subcategory-column', '&--content']]: {
        padding: 0,
        '&::before': {
          display: 'none'
        }
      },
      '&--subcategory-column': {
        marginBottom: 4,
        fontSize: 18,
        color: colors.text1,
        textAlign: 'initial'
      },
      '&--content': {
        background: 'none !important'
      },
      '&--title': {
        marginBottom: 0,
        fontSize: 16,
        fontWeight: 'normal',
        color: 'inherit'
      },
      '&--highlight': {
        boxShadow: 'none !important',
        color: `${colors.primary} !important`,
        background: 'none !important'
      },
      '&--no-results': {
        padding: 32
      }
    },
    '.algolia-docsearch-footer': {
      margin: 12
    }
  }
})

const StyledInput = styled.input(props => ({
  width: '100%',
  height: 40,
  padding: 0,
  paddingLeft: 16,
  border,
  borderRadius,
  boxShadow: props.resultsShown ? boxShadow : 'none',
  fontSize: 14,
  background: 'white',
  outline: 'none',
  appearance: 'none'
}))

const Overlay = styled.div(
  responsiveStyles,
  position('fixed', 0),
  props =>
    !props.visible && {
      opacity: 0,
      visibility: 'hidden'
    },
  {
    backgroundColor: transparentize(0.5, colors.text2),
    transitionProperty: 'opacity, visibility',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-in-out',
    zIndex: 1
  }
)

const ResetButton = styled.button(verticalAlign, size(20), {
  padding: 0,
  border: 0,
  background: 'none',
  cursor: 'pointer',
  outline: 'none',
  color: 'inherit',
  right: 10,
  svg: {
    display: 'block',
    ...size('100%'),
    fill: 'currentColor'
  }
})

function preventDefault(event) {
  event.preventDefault()
}

export default class Search extends Component {
  state = {
    focused: false,
    value: ''
  };

  form = createRef();

  input = createRef();

  search = null;

  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown, true)

    const docsearchApiKey = 'f9a442665bffc5e4e4b548b7eb7aa1a3'
    const indexName = 'getanalytics'
    if (typeof docsearch !== 'undefined' && docsearchApiKey) {
      this.search = docsearch({
        apiKey: docsearchApiKey,
        indexName: indexName,
        inputSelector: '#input',
        debug: true, // keeps the results list open
        autocompleteOptions: {
          openOnFocus: true
        },
        handleSelected: (input, event, suggestion, datasetNumber, context) => {
          input.setVal('')
          // TODO track search selection
          navigate(suggestion.url.replace('https://getanalytics.io', ''))
        }
      })
    }
  }

  componentWillUnmount() {
    window.addEventListener('keydown', this.onKeyDown, true)
  }

  onKeyDown = event => {
    // focus the input when the slash key is pressed
    if (
      event.keyCode === 191 &&
      event.target.tagName.toUpperCase() !== 'INPUT'
    ) {
      event.preventDefault()
      this.input.current.focus()
    }
  };

  onChange = event => this.setState({value: event.target.value});

  onFocus = () => this.setState({focused: true});

  onBlur = () => this.setState({focused: false});

  reset = () => {
    this.setState({value: ''})
    if (this.search) {
      this.search.autocomplete.autocomplete.setVal('')
    }
  };

  render() {
    const {focused, value} = this.state
    const resultsShown = focused && value.trim()
    return (
      <Fragment>
        <Overlay visible={resultsShown} />
        <Container>
          <StyledInput
            ref={this.input}
            id="input"
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onChange={this.onChange}
            value={this.state.value}
            placeholder="Search Docs"
            resultsShown={resultsShown}
          />
          {resultsShown && (
            <ResetButton onMouseDown={preventDefault} onClick={this.reset}>
              <MdClose />
            </ResetButton>
          )}
          {!this.state.focused && !this.state.value && <Hotkey>/</Hotkey>}
        </Container>
      </Fragment>
    )
  }
}
