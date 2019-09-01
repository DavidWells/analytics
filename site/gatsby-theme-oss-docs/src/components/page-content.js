import PropTypes from 'prop-types'
import React, {useRef, useState} from 'react'
import SectionNav from './section-nav'
import nest from 'recompose/nest'
import styled from '@emotion/styled'
import useMount from 'react-use/lib/useMount'
import {FaGithub} from 'react-icons/fa'
import {
  PageNav,
  breakpoints,
  colors,
  headerHeight,
  smallCaps
} from 'gatsby-theme-base'
import { ReactComponent as SpectrumLogo } from '../assets/logos/spectrum.svg'
import {withPrefix} from 'gatsby'

const Container = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  maxWidth: 1200
})

const MainContent = styled.main({
  flexGrow: 1,
  width: 0,
  maxWidth: '100ch'
})

const tableBorder = `1px solid ${colors.divider}`
const table = {
  marginBottom: '1.45rem',
  border: tableBorder,
  borderSpacing: 0,
  borderRadius: 4,
  [['th', 'td']]: {
    padding: 16,
    borderBottom: tableBorder
  },
  'tbody tr:last-child td': {
    border: 0
  },
  th: {
    ...smallCaps,
    fontSize: 13,
    fontWeight: 'normal',
    color: colors.text2,
    textAlign: 'inherit'
  },
  td: {
    verticalAlign: 'top',
    code: {
      whiteSpace: 'normal'
    }
  }
}

const BodyContent = styled.div({
  // style all anchors with an href and no prior classes
  // this helps avoid anchors with names and styled buttons
  'a[href]:not([class])': {
    color: colors.primary,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline'
    },
    code: {
      color: 'inherit'
    }
  },
  [['h1', 'h2', 'h3', 'h4', 'h5', 'h6']]: {
    '&[id]::before': {
      // inspired by https://css-tricks.com/hash-tag-links-padding/
      content: "''",
      display: 'block',
      marginTop: -headerHeight,
      height: headerHeight,
      visibility: 'hidden',
      pointerEvents: 'none'
    },
    ':not(:hover) a svg': {
      visibility: 'hidden'
    },
    'a.anchor': {
      ':hover': {
        opacity: colors.hoverOpacity
      },
      svg: {
        fill: colors.primary
      }
    }
  },
  [['h2', 'h3', 'h4']]: {
    ':not(:first-child)': {
    // ':not(:first-of-type)': {
      marginTop: 36
    }
  },
  img: {
    display: 'block',
    maxWidth: '100%',
    margin: '0 auto'
  },
  table
})

const Aside = styled.aside({
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  width: 260,
  maxHeight: `calc(100vh - ${headerHeight}px)`,
  marginTop: -36,
  marginLeft: 'auto',
  padding: '40px 56px',
  paddingRight: 0,
  position: 'sticky',
  top: headerHeight,
  [breakpoints.lg]: {
    display: 'none'
  },
  [breakpoints.md]: {
    display: 'block'
  },
  [breakpoints.sm]: {
    display: 'none'
  }
})

const AsideHeading = styled.h4({
  fontWeight: 600
})

const AsideLink = nest(
  styled.h5({
    display: 'flex'
  }),
  styled.a({
    display: 'flex',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      opacity: colors.hoverOpacity
    },
    svg: {
      width: 20,
      height: 20,
      marginRight: 6,
      fill: colors.text2
    }
  })
)

export default function PageContent(props) {
  const contentRef = useRef(null)
  const [imagesToLoad, setImagesToLoad] = useState(0)
  const [imagesLoaded, setImagesLoaded] = useState(0)

  useMount(() => {
    if (props.hash) {
      // turn numbers at the beginning of the hash to unicode
      // see https://stackoverflow.com/a/20306237/8190832
      const hash = props.hash.toLowerCase().replace(/^#(\d)/, '#\\3$1 ')
      const hashElement = contentRef.current.querySelector(hash)
      if (hashElement) {
        hashElement.scrollIntoView()
      }
    }

    let toLoad = 0
    const images = contentRef.current.querySelectorAll('img')
    images.forEach(image => {
      if (!image.complete) {
        image.addEventListener('load', handleImageLoad)
        toLoad++
      }
    })

    setImagesToLoad(toLoad)
  })

  function handleImageLoad() {
    setImagesLoaded(prevImagesLoaded => prevImagesLoaded + 1)
  }

  const pageIndex = props.pages.findIndex(page => {
    const prefixedPath = withPrefix(page.path)
    return (
      prefixedPath === props.pathname ||
      prefixedPath.replace(/\/$/, '') === props.pathname
    )
  })

  return (
    <Container>
      <MainContent>
        <BodyContent ref={contentRef} className="content-wrapper">
          {props.children}
        </BodyContent>
        <PageNav
          prevPage={props.pages[pageIndex - 1]}
          nextPage={props.pages[pageIndex + 1]}
        />
      </MainContent>
      <Aside>
        <AsideHeading>
          {props.title}
        </AsideHeading>
        {props.headings.length > 0 && (
          <SectionNav
            headings={props.headings}
            mainRef={props.mainRef}
            contentRef={contentRef}
            imagesLoaded={imagesLoaded === imagesToLoad}
          />
        )}
        <AsideLink href={props.githubUrl}>
          <FaGithub /> Edit on GitHub
        </AsideLink>
        {/*
          <AsideLink href={`https://spectrum.chat/apollo/${props.spectrumPath}`}>
            <SpectrumLogo /> Discuss on Spectrum
          </AsideLink>
        */}
      </Aside>
    </Container>
  )
}

PageContent.propTypes = {
  children: PropTypes.node.isRequired,
  pathname: PropTypes.string.isRequired,
  githubUrl: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired,
  hash: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  mainRef: PropTypes.object.isRequired,
  headings: PropTypes.array.isRequired,
  spectrumPath: PropTypes.string
}
