import { h } from 'preact'
import Wrapper from '../../components/content'

const Home = () => (
	<Wrapper>
		<h1>Analytics Preact demo</h1>
		<p>Open the console to see page views firing. Also checkout the networks tab</p>
		<p><a href="https://getanalytics.io/">View the docs</a></p>
	</Wrapper>
)

export default Home
