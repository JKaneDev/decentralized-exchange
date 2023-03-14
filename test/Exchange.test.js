import { tokens, EVM_REVERT } from '../src/helpers';

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

			it('emits a deposit event', async () => {
				const log = result.logs[0];
				log.event.should.eq('Deposit');
				const event = log.args;
				event.token
					.toString()
					.should.equal(token.address, 'token address is correct');
				event.user.should.equal(user1, 'user address is correct');
				event.amount
					.toString()
					.should.equal(tokens(10).toString(), 'amount is correct');
				event.balance
					.toString()
					.should.equal(tokens(10).toString(), 'balance is correct');
			});
		});

		describe('failure', () => {});
	});
});
