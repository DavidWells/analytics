import React from 'react'
import { Link } from "@reach/router"

const About = () => (
  <div>
    <h1>About</h1>
    <nav>
      <Link to="/">Home</Link> |{" "}
      <Link to="dashboard">Dashboard</Link>
    </nav>
    <div>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris arcu, eu pretium nisi.
      Praesent fringilla ornare ullamcorper. Pellentesque diam orci, sodales in blandit ut, placerat quis felis.
      Vestibulum at sem massa, in tempus nisi. Vivamus ut fermentum odio. Etiam porttitor faucibus volutpat.
      Vivamus vitae mi ligula, non hendrerit urna. Suspendisse potenti. Quisque eget massa a massa semper mollis.
    </div>
  </div>
)

export default About
