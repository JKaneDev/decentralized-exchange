import { get } from 'lodash';
import { createSelector } from 'reselect';

const account = (state) => {
	return state.web3.account;
};
export const accountSelector = createSelector(account, (a) => a);
