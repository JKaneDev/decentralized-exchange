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

	describe('fallback', () => {
		it('reverts when ETH is sent', async () => {
			await exchange
				.sendTransaction({ value: 1, from: user1 })
				.should.be.rejectedWith(EVM_REVERT);
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
			const balance = await exchange.balances(ETH_ADDRESS, user1);
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

	describe('withdrawing ETH', async () => {
		let result;
		let amount;

		beforeEach(async () => {
			amount = ether(1);
			// Deposit ETH first
			await exchange.depositEther({
				from: user1,
				value: amount,
			});
		});

		describe('success', async () => {
			beforeEach(async () => {
				// Deposit ETH first
				result = await exchange.withdrawEther(amount, {
					from: user1,
				});
			});

			it('withdraws ETH funds', async () => {
				const balance = await exchange.balances(ETH_ADDRESS, user1);
				balance.toString().should.equal('0');
			});

			it('emits a Withdraw event', async () => {
				const log = result.logs[0];
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.token
					.toString()
					.should.equal(ETH_ADDRESS, 'token address is correct');
				event.user.should.equal(user1, 'user address is correct');
				event.amount
					.toString()
					.should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal('0', 'balance is correct');
			});
		});

		describe('failure', () => {
			it('rejects withdraws for insufficient balances', async () => {
				await exchange
					.withdrawEther(ether(100), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT);
			});
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
				balance = await exchange.balances(token.address, user1);
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

	describe('withdrawing tokens', async () => {
		let result;
		let amount;

		describe('success', async () => {
			beforeEach(async () => {
				amount = tokens(10);
				await token.approve(exchange.address, amount, { from: user1 });
				await exchange.depositToken(token.address, amount, { from: user1 });

				result = await exchange.withdrawToken(token.address, amount, {
					from: user1,
				});
			});

			it('withdraws ETH funds', async () => {
				const balance = await exchange.balances(token.address, user1);
				balance.toString().should.equal('0');
			});

			it('emits a Withdraw event', async () => {
				const log = result.logs[0];
				log.event.should.eq('Withdraw');
				const event = log.args;
				event.token
					.toString()
					.should.equal(token.address, 'token address is correct');
				event.user.should.equal(user1, 'user address is correct');
				event.amount
					.toString()
					.should.equal(amount.toString(), 'amount is correct');
				event.balance.toString().should.equal('0', 'balance is correct');
			});
		});

		describe('failure', () => {
			it('rejects ETH withdraws', async () => {
				await exchange
					.withdrawToken(ETH_ADDRESS, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT);
			});

			it('fails for insufficient balances', async () => {
				// Withdraw without depositing first
				await exchange
					.withdrawToken(token.address, tokens(10), { from: user1 })
					.should.be.rejectedWith(EVM_REVERT);
			});
		});
	});

	describe('checking balances', async () => {
		beforeEach(async () => {
			await exchange.depositEther({ from: user1, value: ether(1) });
		});

		it('returns user balance', async () => {
			const result = await exchange.balanceOf(ETH_ADDRESS, user1);
			result.toString().should.equal(ether(1).toString());
		});
	});

	describe('making orders', async () => {
		let result;

		beforeEach(async () => {
			result = await exchange.makeOrder(
				token.address,
				tokens(1),
				ETH_ADDRESS,
				ether(1),
				{ from: user1 }
			);
		});

		it('tracks the newly created order', async () => {
			const orderCount = await exchange.orderCount();
			orderCount.toString().should.eq('1');
			const order = await exchange.orders('1');
			order.id.toString().should.equal('1', 'id is correct');
			order.user.should.equal(user1, 'user is correct');
			order.tokenReceived.should.equal(
				token.address,
				'tokenReceived is correct'
			);
			order.amountReceived
				.toString()
				.should.equal(tokens(1).toString(), 'amountReceived is correct');
			order.tokenGiven.should.equal(ETH_ADDRESS, 'tokenGiven is correct');
			order.amountGiven
				.toString()
				.should.equal(ether(1).toString(), 'amountGiven is correct');
			order.timestamp
				.toString()
				.length.should.be.at.least(1, 'timestamp is present');
		});

		it('emits an "Order" event', async () => {
			const log = result.logs[0];
			log.event.should.eq('Order');
			const event = log.args;
			event.id.toString().should.equal('1', 'id is correct');
			event.user.should.equal(user1, 'user is correct');
			event.tokenReceived.should.equal(
				token.address,
				'tokenReceived is correct'
			);
			event.amountReceived
				.toString()
				.should.equal(tokens(1).toString(), 'amountReceived is correct');
			event.tokenGiven.should.equal(ETH_ADDRESS, 'tokenGiven is correct');
			event.amountGiven
				.toString()
				.should.equal(ether(1).toString(), 'amountGiven is correct');
			event.timestamp
				.toString()
				.length.should.be.at.least(1, 'timestamp is present');
		});
	});
});
