import Web3 from 'web3';
import {
	web3Loaded,
	web3AccountLoaded,
	tokenLoaded,
	exchangeLoaded,
	cancelledOrdersLoaded,
	filledOrdersLoaded,
	allOrdersLoaded,
	orderCancelling,
	orderCancelled,
	orderFilling,
	orderFilled,
	etherBalanceLoaded,
	tokenBalanceLoaded,
	exchangeEtherBalanceLoaded,
	exchangeTokenBalanceLoaded,
	balancesLoading,
	balancesLoaded,
	buyOrderMaking,
	sellOrderMaking,
	orderMade,
} from './actions';
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json';
import { ETH_ADDRESS } from './helpers';
const API_KEY = process.env.INFURA_API_KEY || '';

export const loadWeb3 = async (dispatch) => {
	if (typeof window.ethereum !== 'undefined') {
		const web3 = new Web3(window.ethereum);
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		dispatch(web3Loaded(web3));
		return web3;
	} else {
		const sepoliaRpcUrl = `https://sepolia.infura.io/v3/${API_KEY}`;
		try {
			const web3 = new Web3(sepoliaRpcUrl);
			console.log('Connected to Sepolia testnet');
			dispatch(web3Loaded(web3));
			return web3;
		} catch (error) {
			console.log('Failed to connect to Sepolia testnet: ', error);
			window.alert('Please install MetaMask');
			window.location.assign('https://metamask.io/');
		}
	}
};

export const loadAccount = async (web3, dispatch) => {
	const accounts = await web3.eth.getAccounts();
	const account = accounts[0];
	dispatch(web3AccountLoaded(account));
	return account;
};

export const loadToken = async (web3, networkId, dispatch) => {
	try {
		const token = new web3.eth.Contract(Token.abi, Token.networks[networkId].address);
		dispatch(tokenLoaded(token));
		return token;
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const loadExchange = async (web3, networkId, dispatch) => {
	try {
		const exchange = new web3.eth.Contract(Exchange.abi, Exchange.networks[networkId].address);
		dispatch(exchangeLoaded(exchange));
		return exchange;
	} catch (error) {
		console.log('Contract not deployed to the current network. Please select another network with Metamask.');
		return null;
	}
};

export const loadAllOrders = async (exchange, dispatch) => {
	// Fetch cancelled orders with the 'Cancel' event stream
	const cancelStream = await exchange.getPastEvents('Cancel', {
		fromBlock: 0,
		toBlock: 'latest',
	});
	// Format cancelled orders
	const cancelledOrders = cancelStream.map((event) => event.returnValues);
	// Add cancelled orders to the redux store
	dispatch(cancelledOrdersLoaded(cancelledOrders));

	// Fetch filled orders with the 'Trade' event stream
	const tradeStream = await exchange.getPastEvents('Trade', {
		fromBlock: 0,
		toBlock: 'latest',
	});
	// Format filled orders
	const filledOrders = tradeStream.map((event) => event.returnValues);
	// Add filled order stream to redux store
	dispatch(filledOrdersLoaded(filledOrders));

	// Fetch all orders with the 'Order' event stream
	const orderStream = await exchange.getPastEvents('Order', {
		fromBlock: 0,
		toBlock: 'latest',
	});
	// Format filled orders
	const allOrders = orderStream.map((event) => event.returnValues);
	// Add filled order stream to redux store
	dispatch(allOrdersLoaded(allOrders));
};

export const cancelOrder = (dispatch, exchange, order, account) => {
	exchange.methods
		.cancelOrder(order.id)
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(orderCancelling());
		})
		.on('error', (error) => {
			console.log(error);
			window.alert('There was an error!');
		});
};

export const fillOrder = (dispatch, exchange, order, account) => {
	exchange.methods
		.fillOrder(order.id)
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(orderFilling());
		})
		.on('error', (error) => {
			console.log(error);
			window.alert('There was an error!');
		});
};

export const subscribeToEvents = async (exchange, dispatch) => {
	exchange.events.Cancel({}, (error, event) => {
		dispatch(orderCancelled(event.returnValues));
	});

	exchange.events.Trade({}, (error, event) => {
		dispatch(orderFilled(event.returnValues));
	});

	exchange.events.Deposit({}, (error, event) => {
		console.log('Deposit event received: ', event);
		dispatch(balancesLoaded());
	});

	exchange.events.Withdraw({}, (error, event) => {
		console.log('Withdraw event received: ', event);
		dispatch(balancesLoaded());
	});

	exchange.events.Order({}, (error, event) => {
		dispatch(orderMade(event.returnValues));
	});
};

export const loadBalances = async (dispatch, web3, exchange, token, account) => {
	if (typeof account !== 'undefined') {
		// Ether balance in wallet
		const etherBalance = await web3.eth.getBalance(account);
		dispatch(etherBalanceLoaded(etherBalance));

		// Token balance in wallet
		const tokenBalance = await token.methods.balanceOf(account).call();
		dispatch(tokenBalanceLoaded(tokenBalance));

		// Ether balance on exchange
		const exchangeEtherBalance = await exchange.methods.balanceOf(ETH_ADDRESS, account).call();
		dispatch(exchangeEtherBalanceLoaded(exchangeEtherBalance));

		// Token balance in wallet
		const exchangeTokenBalance = await exchange.methods.balanceOf(token.options.address, account).call();
		dispatch(exchangeTokenBalanceLoaded(exchangeTokenBalance));

		// Trigger all balances loaded
		dispatch(balancesLoaded());
	} else {
		window.alert('Please login with MetaMask');
	}
};

export const depositEther = (dispatch, exchange, web3, amount, account) => {
	exchange.methods
		.depositEther()
		.send({ from: account, value: web3.utils.toWei(amount, 'ether') })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

export const withdrawEther = (dispatch, exchange, web3, amount, account) => {
	exchange.methods
		.withdrawEther(web3.utils.toWei(amount, 'ether'))
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

export const depositToken = (dispatch, exchange, token, web3, amount, account) => {
	amount = web3.utils.toWei(amount, 'ether');

	token.methods
		.approve(exchange.options.address, amount)
		.send({ from: account })
		.on('transactionHash', (hash) => {
			exchange.methods
				.depositToken(token.options.address, amount)
				.send({ from: account })
				.on('transactionHash', (hash) => {
					dispatch(balancesLoading());
				})
				.on('error', (error) => {
					console.error(error);
					window.alert(`There was an error!`);
				});
		});
};

export const withdrawToken = (dispatch, exchange, token, web3, amount, account) => {
	exchange.methods
		.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether'))
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(balancesLoading());
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

export const makeBuyOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenReceived = token.options.address;
	const amountReceived = web3.utils.toWei(order.amount, 'ether');
	const tokenGiven = ETH_ADDRESS;
	const amountGiven = web3.utils.toWei((order.amount * order.price).toString(), 'ether');

	exchange.methods
		.makeOrder(tokenReceived, amountReceived, tokenGiven, amountGiven)
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(buyOrderMaking());
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};

export const makeSellOrder = (dispatch, exchange, token, web3, order, account) => {
	const tokenReceived = ETH_ADDRESS;
	const amountReceived = web3.utils.toWei((order.amount * order.price).toString(), 'ether');
	const tokenGiven = token.options.address;
	const amountGiven = web3.utils.toWei(order.amount, 'ether');

	exchange.methods
		.makeOrder(tokenReceived, amountReceived, tokenGiven, amountGiven)
		.send({ from: account })
		.on('transactionHash', (hash) => {
			dispatch(sellOrderMaking());
		})
		.on('error', (error) => {
			console.error(error);
			window.alert(`There was an error!`);
		});
};
