import { connect } from 'react-redux';
import Spinner from './Spinner';
import { Tabs, Tab } from 'react-bootstrap';
import {
	myFilledOrdersLoadedSelector,
	myFilledOrdersSelector,
	myOpenOrdersLoadedSelector,
	myOpenOrdersSelector,
} from '../store/selectors';

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
