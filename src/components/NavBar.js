import { connect } from 'react-redux';
import { accountSelector } from '../store/selectors';

const Navbar = (props) => {
	return (
		<nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
			<a className='navbar-brand' href='#/'>
				X Token Exchange
			</a>

			<ul className='navbar-nav ml-auto'>
				<li className='nav-item'>
					<a
						className='nav-link small'
						href={`https://etherscan.io/address/${props.account}`}
						target='_blank'
						rel='noopener noreferrer'
					>
						{props.account}
					</a>
				</li>
			</ul>
		</nav>
	);
};

function mapStateToProps(state) {
	return {
		account: accountSelector(state),
	};
}

export default connect(mapStateToProps)(Navbar);
