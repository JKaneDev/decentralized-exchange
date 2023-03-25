require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

const privateKeys = process.env.PRIVATE_KEYS || '';
const API_KEY = process.env.INFURA_API_KEY || '';

module.exports = {
	networks: {
		development: {
			host: '127.0.0.1',
			port: 7545,
			network_id: '*',
		},
		sepolia: {
			provider: function () {
				return new HDWalletProvider(
					// Private Key
					privateKeys.split(','),
					// URL to an Ethereum Node
					`https://sepolia.infura.io/v3/${API_KEY}`,
				);
			},
			gas: 6000000,
			gasPrice: 20000000000,
			network_id: 11155111,
		},
	},
	contracts_directory: './src/contracts/',
	contracts_build_directory: './src/abis/',
	mocha: {
		// timeout: 100000
	},
	compilers: {
		solc: {
			version: '0.8.19',
			settings: {
				optimizer: {
					enabled: true,
					runs: 200,
				},
			},

			paths: ['/usr/local/bin', '/usr/bin', '/bin', '/opt/homebrew/bin'],
		},
	},
};
