const Web3 = require('web3');

const ether = (n) => {
	return new Web3.utils.BN(Web3.utils.toWei(n.toString(), 'ether'));
};

const tokens = (n) => ether(n);

const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';

const EVM_REVERT = 'VM Exception while processing transaction: revert';

const wait = (seconds) => {
	const milliseconds = seconds * 1000;
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

module.exports = {
	ether,
	tokens,
	ETH_ADDRESS,
	EVM_REVERT,
	wait,
};
