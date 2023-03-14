import Web3 from 'web3';
import { tokens, EVM_REVERT, ETH_ADDRESS, ether } from '../src/helpers';

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai').use(require('chai-as-promised')).should();

contract('Exchange', ([deployer, feeAccount, user1]) => {
	let exchange;
	let token;
	const feePercent = 10;

	beforeEach(async () => {
		// Deploy Token
		token = await Token.new();
		// Deploy Exchange
		exchange = await Exchange.new(feeAccount, feePercent);
		// Transfer tokens to user1
		token.transfer(user1, tokens(100), { from: deployer });
	});

	describe('deployment', () => {
		it('tracks the fee account', async () => {
			const result = await exchange.feeAccount();
			result.should.equal(feeAccount);
		});

		it('tracks the fee percent', async () => {
			const result = await exchange.feePercent();
			result.toString().should.equal(feePercent.toString());
		});
	});

	describe('depositing ETH', async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(1);
			result = await exchange.depositEther({
				from: user1,
				value: amount,
			});
		});

		it('tracks the ETH deposit', async () => {
			const balance = await exchange.tokens(ETH_ADDRESS, user1);
			balance.toString().should.equal(amount.toString());
		});

		it('emits a deposit event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Deposit');
			const event = log.args;
			event.token
				.toString()
				.should.equal(ETH_ADDRESS, 'token address is correct');
			event.user.should.equal(user1, 'user address is correct');
			event.amount
				.toString()
				.should.equal(amount.toString(), 'amount is correct');
			event.balance
				.toString()
				.should.equal(amount.toString(), 'balance is correct');
		});
	});

	describe('depositing tokens', () => {
		let result;
		let amount;

		describe('success', () => {
			beforeEach(async () => {
				amount = tokens(10);
				await token.approve(exchange.address, amount, { from: user1 });
				result = await exchange.depositToken(token.address, amount, {
					from: user1,
				});
			});
			it('tracks the token deposit', async () => {
				// Check token balance
				let balance = await token.balanceOf(exchange.address);
				balance.toString().should.equal(amount.toString());
				balance = await exchange.tokens(token.address, user1);
				balance.toString().should.equal(amount.toString());
			});

			it('emits a Deposit event', async () => {
				const log = result.logs[0];
				log.event.should.eq('Deposit');
				const event = log.args;
				event.token
					.toString()
					.should.equal(token.address, 'token address is correct');
				event.user.should.equal(user1, 'user address is correct');
				event.amount
					.toString()
					.should.equal(amount.toString(), 'amount is correct');
				event.balance
					.toString()
					.should.equal(amount.toString(), 'balance is correct');
			});
		});

		describe('failure', () => {
			it('rejects ETH deposits', async () => {
				await exchange
					.depositToken(ETH_ADDRESS, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('fails when no tokens are approved', async () => {
				await exchange
					.depositToken(token.address, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT);
			});
		});
	});
});
