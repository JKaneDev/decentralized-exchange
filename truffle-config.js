require('babel-register');
require('babel-polyfill');
require('dotenv').config();

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
module.exports = {
	networks: {
		development: {
			host: '127.0.0.1',
			port: 7545,
			network_id: '*',
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
