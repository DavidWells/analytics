import React, { useEffect } from 'react'
import Navigation from '../../fragments/Nav'
import analytics from '../../utils/analytics'


const About = () => {
  useEffect(() => {
    const state = analytics.getState('page')
    console.log('page state', state)
    analytics.track('foobar', () => {
      console.log('tracked foobar')
    })
  }, [])
  return (
    <div>
      <Navigation />
      <h1>About</h1>
      <div>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
        Praesent fringilla ornare ullamcorper. Pellentesque diam orci, sodales in blandit ut, placerat quis felis.
        Vestibulum at sem massa, in tempus nisi. Vivamus ut fermentum odio. Etiam porttitor faucibus volutpat.
        Vivamus vitae mi ligula, non hendrerit urna. Suspendisse potenti. Quisque eget massa a massa semper mollis.
      </div>
    </div>
  )
}

export default About
