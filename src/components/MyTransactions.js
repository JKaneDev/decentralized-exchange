import { connect } from 'react-redux';
import Spinner from './Spinner';
import { Tabs, Tab } from 'react-bootstrap';
import {
	myFilledOrdersLoadedSelector,
	myFilledOrdersSelector,
	myOpenOrdersLoadedSelector,
	myOpenOrdersSelector,
} from '../store/selectors';

const renderMyFilledOrders = (myFilledOrders) => {
	return (
		<tbody>
			{myFilledOrders.map((order) => {
				return (
					<tr key={order.id}>
						<td className='text-muted'>{order.formattedTimestamp}</td>
						<td className={`text-${order.orderTypeClass}`}>
							{order.orderSign}
							{order.tokenAmount}
						</td>
						<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
					</tr>
				);
			})}
		</tbody>
	);
};

const renderMyOpenOrders = (myOpenOrders) => {
	return (
		<tbody>
			{myOpenOrders.map((order) => {
				return (
					<tr key={order.id}>
						<td className={`text-${order.orderTypeClass}`}>{order.tokenAmount}</td>
						<td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
						<td className='text-muted'>x</td>
					</tr>
				);
			})}
		</tbody>
	);
};

const MyTransactions = ({ myFilledOrders, showMyFilledOrders, myOpenOrders, showMyOpenOrders }) => {
	return (
		<div className='vertical'>
			<div className='card bg-dark text-white'>
				<div className='card-header'>My Transactions</div>
				<div className='card-body my-transactions'>
					<Tabs defaultActiveKey='trades' className='bg-dark text-white'>
						<Tab eventKey='trades' title='Trades' className='bg-dark'>
							<table className='table table-dark table-sm small'>
								<thead>
									<tr>
										<th>Time</th>
										<th>XTK</th>
										<th>XTK/ETH</th>
									</tr>
								</thead>
								{showMyFilledOrders ? renderMyFilledOrders(myFilledOrders) : <Spinner type='table' />}
							</table>
						</Tab>
						<Tab eventKey='orders' title='Orders' className='bg-dark'>
							<table className='table table-dark table-sm small'>
								<thead>
									<tr>
										<th>Amount</th>
										<th>XTK/ETH</th>
										<th>Cancel</th>
									</tr>
								</thead>
								{showMyOpenOrders ? renderMyOpenOrders(myOpenOrders) : <Spinner type='table' />}
							</table>
						</Tab>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		myFilledOrders: myFilledOrdersSelector(state),
		showMyFilledOrders: myFilledOrdersLoadedSelector(state),
		myOpenOrders: myOpenOrdersSelector(state),
		showMyOpenOrders: myOpenOrdersLoadedSelector(state),
	};
}

export default connect(mapStateToProps)(MyTransactions);
