import { get } from 'lodash';
import { createSelector } from 'reselect';

const account = (state) => {
	return get(state, 'web3.account');
};
export const accountSelector = createSelector(account, (a) => a);

const tokenLoaded = (state) => (state.token ? true : false);
export const tokenLoadedSelector = createSelector(tokenLoaded, (tl) => tl);

const exchangeLoaded = (state) => (state.exchange ? true : false);
export const exchangeLoadedSelector = createSelector(
	exchangeLoaded,
	(el) => el
);

export const contractLoadedSelector = createSelector(
	tokenLoaded,
	exchangeLoaded,
	(tl, el) => tl && el
);
