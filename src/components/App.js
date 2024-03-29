import './App.css';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { loadWeb3, loadAccount, loadToken, loadExchange } from '../store/interactions';
import NavBar from './NavBar';
import Content from './Content';
import { contractLoadedSelector } from '../store/selectors';

function App(props) {
	useEffect(() => {
		loadBlockchainData(props.dispatch);
	}, []);

	const loadBlockchainData = async (dispatch) => {
		const web3 = await loadWeb3(dispatch);
		const networkId = await web3.eth.net.getId();
		await loadAccount(web3, dispatch);
		const token = await loadToken(web3, networkId, dispatch);
		const exchange = await loadExchange(web3, networkId, dispatch);

		if (!token) {
			window.alert(
				'Token smart contract not detected on the current network. Please select another network with Metamask',
			);
		}

		if (!exchange) {
			window.alert(
				'Exchange smart contract not detected on the current network. Please select another network with Metamask',
			);
		}
	};

	return (
		<div>
			<NavBar />
			{props.contractsLoaded ? <Content /> : <div className='content'></div>}
		</div>
	);
}

function mapStateToProps(state) {
	return {
		contractsLoaded: contractLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(App);
