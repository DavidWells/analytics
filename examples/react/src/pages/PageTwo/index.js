import React, { Component } from 'react'
import Nav from '../../components/Nav'
import Layout from '../../components/Layout'

export default class PageTwo extends Component {
  render() {
    return (
      <Layout title='Page two'>
        <div className='page-content'>
          <Nav />
          <h2>Page Two</h2>
          <p>
            Page two and lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Integer vitae mauris arcu, eu pretium nisi. Praesent fringilla ornare ullamcorper.
            Pellentesque diam orci, sodales in blandit ut, placerat quis felis.
            Vestibulum at sem massa, in tempus nisi. Vivamus ut fermentum odio.
            Etiam porttitor faucibus volutpat. Vivamus vitae mi ligula, non hendrerit urna.
            Suspendisse potenti. Quisque eget massa a massa semper mollis.
          </p>
        </div>
      </Layout>
    )
  }
}
