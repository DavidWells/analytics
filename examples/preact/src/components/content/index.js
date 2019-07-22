import style from './style'

const Wrapper = (props) => (
	<div class={style.wrapper}>
		{props.children}
	</div>
)

export default Wrapper
