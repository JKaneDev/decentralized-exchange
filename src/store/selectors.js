import moment from 'moment';
import { get } from 'lodash';
import { createSelector } from 'reselect';
import { ETH_ADDRESS, tokens, ether, GREEN, RED } from './helpers';

const account = (state) => {
	return get(state, 'web3.account');
};
export const accountSelector = createSelector(account, (a) => a);

const token = (state) => state.token.contract;
export const tokenSelector = createSelector(token, (t) => t);

const tokenLoaded = (state) => get(state, 'token.loaded');
export const tokenLoadedSelector = createSelector(tokenLoaded, (tl) => tl);

const exchange = (state) => state.exchange.contract;
export const exchangeSelector = createSelector(exchange, (e) => e);

const exchangeLoaded = (state) => get(state, 'exchange.loaded', false);
export const exchangeLoadedSelector = createSelector(exchangeLoaded, (el) => el);

export const contractLoadedSelector = createSelector(tokenLoaded, exchangeLoaded, (tl, el) => tl && el);
// ALL ORDERS
const allOrders = (state) => get(state, 'exchange.allOrders.data', []);
export const allOrdersSelector = createSelector(allOrders, (o) => o);
const allOrdersLoaded = (state) => get(state, 'exchange.allOrders.loaded', false);
export const allOrdersLoadedSelector = createSelector(allOrdersLoaded, (loaded) => loaded);

// CANCELLED ORDERS
const cancelledOrders = (state) => get(state, 'exchange.cancelledOrders.data', []);
export const cancelledOrdersSelector = createSelector(cancelledOrders, (o) => o);
const cancelledOrdersLoaded = (state) => get(state, 'exchange.cancelledOrders.loaded', false);
export const cancelledOrdersLoadedSelector = createSelector(cancelledOrdersLoaded, (loaded) => loaded);

// FILLED ORDERS
const filledOrdersLoaded = (state) => get(state, 'exchange.filledOrders.loaded', false);
export const filledOrdersLoadedSelector = createSelector(filledOrdersLoaded, (loaded) => loaded);
const filledOrders = (state) => get(state, 'exchange.filledOrders.data', []);
export const filledOrdersSelector = createSelector(filledOrders, (orders) => {
	// Sort orders by date ascending for price comparison
	orders = orders.sort((a, b) => a.timestamp - b.timestamp);

	// Decorate Orders
	orders = decorateFilledOrders(orders);

	// Sort orders by date descending for price comparison
	orders = orders.sort((a, b) => b.timestamp - a.timestamp);
	console.log('FILLED ORDERS: ', orders);
	return orders;
});

// ORDER DECORATION
const decorateFilledOrders = (orders) => {
	// Track previous order to compare history
	let previousOrder = orders[0];
	return orders.map((order) => {
		order = decorateOrder(order);
		order = decorateFilledOrder(order, previousOrder);
		previousOrder = order; // Update the previous order once it's decorated
		return order;
	});
};

const decorateOrder = (order) => {
	let etherAmount;
	let tokenAmount;

	if (order.tokenGiven === ETH_ADDRESS) {
		etherAmount = order.amountGiven;
		tokenAmount = order.amountReceived;
	} else {
		etherAmount = order.amountReceived;
		tokenAmount = order.amountGiven;
	}

	// Calculate token price to 5 decimal place
	let tokenPrice = etherAmount / tokenAmount;
	const precision = 100000;
	tokenPrice = Math.round(tokenPrice * precision) / precision;

	return {
		...order,
		etherAmount: ether(etherAmount),
		tokenAmount: tokens(tokenAmount),
		tokenPrice: tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa D/M'),
	};
};

const decorateFilledOrder = (order, previousOrder) => {
	return {
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
	};
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
	// Show green price if only one order exists
	if (previousOrder.id === orderId) {
		return GREEN;
	}

	// Show green price if order price higher than previous order
	// show red price if order price lower than previous order
	if (previousOrder.tokenPrice <= tokenPrice) {
		return GREEN; // Success
	} else {
		return RED; // Danger
	}
};

const orderBookLoaded = (state) => cancelledOrdersLoaded(state) && filledOrdersLoaded(state) && allOrdersLoaded(state);

const openOrders = (state) => {
	const all = allOrders(state);
	const cancelled = cancelledOrders(state);
	const filled = filledOrders(state);

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id === order.id);
		const orderCancelled = cancelled.some((o) => o.id === order.id);
		return orderFilled || orderCancelled;
	});

	return openOrders;
};

// CREATE THE ORDER BOOK
export const orderBookSelector = createSelector(openOrders, (orders) => {
	// Decorate Order Book Orders
	return orders;
});
