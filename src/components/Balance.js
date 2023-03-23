import { useEffect } from 'react';
import { connect } from 'react-redux';
import {
	exchangeSelector,
	accountSelector,
	tokenSelector,
	web3Selector,
	etherBalanceSelector,
	tokenBalanceSelector,
	exchangeEtherBalanceSelector,
	exchangeTokenBalanceSelector,
	balancesLoadingSelector,
	etherDepositAmountSelector,
} from '../store/selectors';
import { etherDepositAmountChanged } from '../store/actions';
import { loadBalances, depositEther } from '../store/interactions';
import Spinner from './Spinner';
import { Tabs, Tab } from 'react-bootstrap';

const renderDashboard = (
	etherBalance,
	exchangeEtherBalance,
	tokenBalance,
	exchangeTokenBalance,
	dispatch,
	web3,
	exchange,
	account,
	etherDepositAmount,
) => {
	return (
		<Tabs defaultActiveKey='deposit' className='bg-dark text-white'>
			<Tab eventKey='deposit' title='Deposit' className='bg-dark'>
				<table className='table table-dark table-sm small'>
					<thead>
						<tr>
							<th>Token</th>
							<th>Wallet</th>
							<th>Exchange</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>ETH</th>
							<th>{etherBalance}</th>
							<th>{exchangeEtherBalance}</th>
						</tr>
						<tr>
							<th>XTK</th>
							<th>{tokenBalance}</th>
							<th>{exchangeTokenBalance}</th>
						</tr>
					</tbody>
				</table>
				<form
					className='row'
					onSubmit={(event) => {
						event.preventDefault();
						depositEther(dispatch, exchange, web3, etherDepositAmount, account);
					}}
				>
					<div className='col-12 col-sm pr-sm-2'>
						<input
							type='text'
							placeholder='ETH Amount'
							onChange={(e) => dispatch(etherDepositAmountChanged(e.target.value))}
							className='form-control form-control-sm bg-dark text-white'
							required
						/>
					</div>
					<div className='col-12 col-sm-auto pl-sm-0'>
						<button type='submit' className='btn btn-primary btn-block btn-sm'>
							Deposit
						</button>
					</div>
				</form>
			</Tab>
			<Tab eventKey='withdraw' title='Withdraw' className='bg-dark'></Tab>
		</Tabs>
	);
};

const Balance = ({
	dispatch,
	exchange,
	web3,
	token,
	account,
	showForm,
	etherBalance,
	exchangeEtherBalance,
	tokenBalance,
	exchangeTokenBalance,
	etherDepositAmount,
}) => {
	useEffect(() => {
		loadBlockchainData(dispatch, exchange, web3, token, account, showForm);
	}, []);

	const loadBlockchainData = async (dispatch, exchange, web3, token, account, showForm) => {
		await loadBalances(dispatch, web3, exchange, token, account);
	};

	return (
		<div className='card bg-dark text-white'>
			<div className='card-header'>Balance</div>
			<div className='card-body'>
				{showForm ? (
					renderDashboard(
						etherBalance,
						exchangeEtherBalance,
						tokenBalance,
						exchangeTokenBalance,
						dispatch,
						web3,
						exchange,
						account,
						etherDepositAmount,
					)
				) : (
					<Spinner type='table' />
				)}
			</div>
		</div>
	);
};

function mapStateToProps(state) {
	const balancesLoading = balancesLoadingSelector(state);

	console.log({
		web3: web3Selector(state),
		account: accountSelector(state),
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
		etherBalance: etherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		balancesLoading,
		showForm: !balancesLoading,
		etherDepositAmount: etherDepositAmountSelector(state),
	});

	return {
		web3: web3Selector(state),
		account: accountSelector(state),
		exchange: exchangeSelector(state),
		token: tokenSelector(state),
		etherBalance: etherBalanceSelector(state),
		tokenBalance: tokenBalanceSelector(state),
		exchangeEtherBalance: exchangeEtherBalanceSelector(state),
		exchangeTokenBalance: exchangeTokenBalanceSelector(state),
		balancesLoading,
		showForm: !balancesLoading,
		etherDepositAmount: etherDepositAmountSelector(state),
	};
}

export default connect(mapStateToProps)(Balance);
