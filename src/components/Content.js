import { connect, useDispatch } from 'react-redux';
import { loadAllOrders, subscribeToEvents } from '../store/interactions';
import { tokenSelector, exchangeSelector } from '../store/selectors';
import { useEffect } from 'react';
import Trades from './Trades';
import OrderBook from './OrderBook';
import MyTransactions from './MyTransactions';
import PriceChart from './PriceChart';
import Balance from './Balance';
import NewOrder from './NewOrder';

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
				<NewOrder />
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
