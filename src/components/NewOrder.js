import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap';
import Spinner from './Spinner';
import {
	exchangeSelector,
	tokenSelector,
	accountSelector,
	web3Selector,
	buyOrderSelector,
	sellOrderSelector,
} from '../store/selectors';
import {
	buyOrderAmountChanged,
	buyOrderPriceChanged,
	sellOrderAmountChanged,
	sellOrderPriceChanged,
} from '../store/actions';
import { makeBuyOrder, makeSellOrder } from '../store/interactions';

const renderForm = (dispatch, exchange, token, web3, buyOrder, sellOrder, account, showBuyTotal, showSellTotal) => {
	return (
		<Tabs defaultActiveKey='buy' className='bg-dark text-white'>
			<Tab eventKey='buy' title='Buy' className='bg-dark'>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						makeBuyOrder(dispatch, exchange, token, web3, buyOrder, account);
					}}
				>
					<div className='form-group small'>
						<label>Buy Amount (XTK)</label>
						<div className='input-group orders'>
							<input
								type='text'
								className='form-control form-control-sm bg-dark text-white'
								placeholder='Buy Amount'
								onChange={(e) => dispatch(buyOrderAmountChanged(e.target.value))}
								required
							/>
						</div>
					</div>
					<div className='form-group small'>
						<label>Buy Price</label>
						<div className='input-group orders'>
							<input
								type='text'
								className='form-control form-control-sm bg-dark text-white'
								placeholder='Buy Price'
								onChange={(e) => dispatch(buyOrderPriceChanged(e.target.value))}
								required
							/>
						</div>
					</div>
					<button type='submit' className='btn btn-primary btn-sm btn-block order-btn'>
						Buy Order
					</button>
					{showBuyTotal ? <small>Total: {buyOrder.amount * buyOrder.price} ETH</small> : null}
				</form>
			</Tab>
			<Tab eventKey='sell' title='Sell' className='bg-dark'>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						makeSellOrder(dispatch, exchange, token, web3, sellOrder, account);
					}}
				>
					<div className='form-group small'>
						<label>Sell Amount (XTK)</label>
						<div className='input-group orders'>
							<input
								type='text'
								className='form-control form-control-sm bg-dark text-white'
								placeholder='Sell Amount'
								onChange={(e) => dispatch(sellOrderAmountChanged(e.target.value))}
								required
							/>
						</div>
					</div>
					<div className='form-group small'>
						<label>Sell Price</label>
						<div className='input-group orders'>
							<input
								type='text'
								className='form-control form-control-sm bg-dark text-white'
								placeholder='Sell Price'
								onChange={(e) => dispatch(sellOrderPriceChanged(e.target.value))}
								required
							/>
						</div>
					</div>
					<button type='submit' className='btn btn-primary btn-sm btn-block' id='order-btn'>
						Sell Order
					</button>
					{showSellTotal ? <small>Total: {sellOrder.amount * sellOrder.price} XTK</small> : null}
				</form>
			</Tab>
		</Tabs>
	);
};

const NewOrder = ({
	dispatch,
	exchange,
	token,
	account,
	web3,
	buyOrder,
	sellOrder,
	showForm,
	showBuyTotal,
	showSellTotal,
}) => {
	return (
		<div className='card bg-dark text-white'>
			<div className='card-header'>New Order</div>
			<div className='card-body new-orders'>
				{showForm ? (
					renderForm(dispatch, exchange, token, web3, buyOrder, sellOrder, account, showBuyTotal, showSellTotal)
				) : (
					<Spinner />
				)}
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	const buyOrder = buyOrderSelector(state);
	const sellOrder = sellOrderSelector(state);

	console.log({
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
		account: accountSelector(state),
		web3: web3Selector(state),
		buyOrder,
		sellOrder,
		// showForm: !buyOrder.making && !sellOrder.making,
	});
	return {
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
		account: accountSelector(state),
		web3: web3Selector(state),
		buyOrder,
		sellOrder,
		showForm: !buyOrder.making && !sellOrder.making,
		showBuyTotal: buyOrder.amount && buyOrder.price,
		showSellTotal: sellOrder.amount && sellOrder.price,
	};
}

export default connect(mapStateToProps)(NewOrder);