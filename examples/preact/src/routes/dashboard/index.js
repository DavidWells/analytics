import { h } from 'preact'
import Wrapper from '../../components/content'
import { Link } from 'preact-router/match'

const Dashboard = () => (
	<Wrapper>
		<h1>Dashboard</h1>
		<p>This is the dashboard page. Only logged in folks can use this</p>
		<div>
			<Link href="/dashboard/one">
				Sub item one
			</Link>
		</div>
		<div>
			<Link href="/dashboard/two">
				Sub item two
			</Link>
		</div>
		<div>
			<Link href="/dashboard/three">
				Sub item three
			</Link>
		</div>
	</Wrapper>
)

export default Dashboard
