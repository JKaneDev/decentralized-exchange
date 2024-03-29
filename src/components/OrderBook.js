import { connect } from 'react-redux';
import Spinner from './Spinner';
import {
	orderBookSelector,
	orderBookLoadedSelector,
	accountSelector,
	exchangeSelector,
	orderFillingSelector,
} from '../store/selectors';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { fillOrder } from '../store/interactions';

const renderOrder = (order, exchange, account, dispatch) => {
	return (
		<OverlayTrigger
			key={order.id}
			placement='bottom'
			overlay={<Tooltip key={order.id} id={order.id}>{`Click here to ${order.orderFillAction}`}</Tooltip>}
		>
			<tr key={order.id} className='order-book-order' onClick={(e) => fillOrder(dispatch, exchange, order, account)}>
				<td>{order.tokenAmount}</td>
				<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
				<td>{order.etherAmount}</td>
			</tr>
		</OverlayTrigger>
	);
};

const renderOrders = ({ orderBook, exchange, account, dispatch }) => {
	return (
		<tbody>
			{orderBook.sellOrders.map((order) => renderOrder(order, exchange, account, dispatch))}
			<tr>
				<th>XTK</th>
				<th>XTK/ETH</th>
				<th>ETH</th>
			</tr>
			{orderBook.buyOrders.map((order) => renderOrder(order, exchange, account, dispatch))}
		</tbody>
	);
};

const OrderBook = ({ orderBook, showOrderBook, account, exchange, dispatch }) => {
	return (
		<div className='vertical'>
			<div className='card bg-dark text-white'>
				<div className='card-header'>Order Book</div>
				<div className='card-body order-book'>
					<table className='table table-dark table-sm small'>
						{showOrderBook ? renderOrders({ orderBook, account, exchange, dispatch }) : <Spinner type='table' />}
					</table>
				</div>
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	const orderBookLoaded = orderBookLoadedSelector(state);
	const orderFilling = orderFillingSelector(state);

	return {
		orderBook: orderBookSelector(state),
		showOrderBook: orderBookLoaded && !orderFilling,
		account: accountSelector(state),
		exchange: exchangeSelector(state),
	};
}

export default connect(mapStateToProps)(OrderBook);
