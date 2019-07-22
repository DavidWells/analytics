import { h } from 'preact'
import { Link } from 'preact-router/match'
import style from './style'

const Header = () => (
	<header class={style.header}>
		<Link activeClassName={style.active} href="/">
			<h1>Preact App</h1>
		</Link>
		<nav>
			<Link activeClassName={style.active} href="/">
				Home
			</Link>
			<Link activeClassName={style.active} href="/about">
				About
			</Link>
			<Link activeClassName={style.active} href="/dashboard">
				Dashboard
			</Link>
			<Link activeClassName={style.active} href="/dashboard/profile">
				Profile
			</Link>
			<Link activeClassName={style.active} href="/this-url-does-not-exist">
				404 link
			</Link>
		</nav>
	</header>
)

export default Header
