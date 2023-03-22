import { connect, useDispatch } from 'react-redux';
import { loadAllOrders, subscribeToEvents } from '../store/interactions';
import { tokenSelector, exchangeSelector } from '../store/selectors';
import { useEffect } from 'react';
import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from './MyTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';

const Content = (props) => {
	const dispatch = useDispatch();

	useEffect(() => {
		loadBlockchainData(props);
	}, []);

	async function loadBlockchainData({ exchange }) {
		await loadAllOrders(exchange, dispatch);
		await subscribeToEvents(exchange, dispatch);
	}

	return (
		<div className='content'>
			<div className='vertical-split'>
				<Balance />
				<div className='card bg-dark text-white'>
					<div className='card-header'>Card Title</div>
					<div className='card-body'>
						<p className='card-text'>
							Some quick example text to build on the card title and make up the bulk of the card's content.
						</p>
						<a href='/#' className='card-link'>
							Card link
						</a>
					</div>
				</div>
			</div>
			<div className='vertical'>
				<OrderBook />
			</div>
			<div className='vertical-split'>
				<PriceChart />
				<MyTransactions />
			</div>
			<Trades />
		</div>
	);
};

function mapStateToProps(state) {
	return {
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
	};
}

export default connect(mapStateToProps)(Content);
