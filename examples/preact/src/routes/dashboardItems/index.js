import { h, Component } from 'preact'
import { Link } from 'preact-router/match'
import Wrapper from '../../components/content'

export default class DashboardItem extends Component {
	// Note: `id` comes from the URL, courtesy of our router
	render(props, state) {
		const { id } = props
		return (
			<Wrapper>
				<h1>Dashboard Item: {id}</h1>
				<p>This is a sub page!</p>
				<Link href="/dashboard/">
					Back
				</Link>
			</Wrapper>
		)
	}
}
