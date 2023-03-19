import './App.css';
import Token from '../abis/Token.json';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	loadWeb3,
	loadAccount,
	loadToken,
	loadExchange,
} from '../store/interactions';
import { accountSelector } from '../store/selectors';
import NavBar from './NavBar';

function App(props) {
	useEffect(() => {
		loadBlockchainData(props.dispatch);
	}, []);

	const loadBlockchainData = async (dispatch) => {
		const web3 = await loadWeb3(dispatch);
		const networkId = await web3.eth.net.getId();
		const accounts = await loadAccount(web3, dispatch);
		const token = await loadToken(web3, networkId, dispatch);
		loadExchange(web3, networkId, dispatch);
	};

	return (
		<div>
			<NavBar />
			<div className='content'>
				<div className='vertical-split'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical-split'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
				<div className='vertical'>
					<div className='card bg-dark text-white'>
						<div className='card-header'>Card Title</div>
						<div className='card-body'>
							<p className='card-text'>
								Some quick example text to build on the card title and make up
								the bulk of the card's content.
							</p>
							<a href='/#' className='card-link'>
								Card link
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function mapStateToProps(state) {
	return {
		// TODO: fill me in...
	};
}

export default connect(mapStateToProps)(App);
