import { get } from 'lodash';
import { createSelector } from 'reselect';

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
export const exchangeLoadedSelector = createSelector(
	exchangeLoaded,
	(el) => el
);

export const contractLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => tl && el
);
