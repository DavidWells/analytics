import { h } from 'preact'
import Wrapper from '../components/content'

/** fall-back route (handles unroutable URLs) */
const Error = ({ type, url }) => (
	<Wrapper>
		<h1>Error {type}</h1>
		<p>It looks like we hit a snag.</p>
		<pre>{url}</pre>
	</Wrapper>
)

export default Error
