import { connect } from 'react-redux';
import Spinner from './Spinner';
import { orderBookSelector, orderBookLoadedSelector } from '../store/selectors';

const renderOrder = (order) => {
	return (
		<tr key={order.id}>
			<td>{order.tokenAmount}</td>
			<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
			<td>{order.etherAmount}</td>
		</tr>
	);
};

const renderOrders = ({ orderBook }) => {
	return (
		<tbody>
			{orderBook.sellOrders.map((order) => renderOrder(order))}
			<tr>
				<th>XTK</th>
				<th>XTK/ETH</th>
				<th>ETH</th>
			</tr>
			{orderBook.buyOrders.map((order) => renderOrder(order))}
		</tbody>
	);
};

const OrderBook = ({ orderBook, showOrderBook }) => {
	return (
		<div className='vertical'>
			<div className='card bg-dark text-white'>
				<div className='card-header'>Order Book</div>
				<div className='card-body order-book'>
					<table className='table table-dark table-sm small'>
						{showOrderBook ? renderOrders({ orderBook }) : <Spinner type='table' />}
					</table>
				</div>
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		orderBook: orderBookSelector(state),
		showOrderBook: orderBookLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(OrderBook);
