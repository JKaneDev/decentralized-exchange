import Web3 from 'web3';
import { tokens, EVM_REVERT, ETH_ADDRESS, ether } from '../src/helpers';

const Token = artifacts.require('./Token');
const Exchange = artifacts.require('./Exchange');

require('chai').use(require('chai-as-promised')).should();

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
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

	describe('order actions', async () => {
		beforeEach(async () => {
			// user1 deposits ETH only
			await exchange.depositEther({ from: user1, value: ether(1) });
			// give tokens to user2
			await token.transfer(user2, tokens(100), { from: deployer });
			// user2 deposits tokens only
			await token.approve(exchange.address, tokens(2), { from: user2 });
			await exchange.depositToken(token.address, tokens(2), { from: user2 });
			// user1 makes an order to buy tokens with ETH
			await exchange.makeOrder(
				token.address,
				tokens(1),
				ETH_ADDRESS,
				ether(1),
				{ from: user1 }
			);
		});

		describe('filling orders', async () => {
			let result;

			describe('success', async () => {
				beforeEach(async () => {
					result = await exchange.fillOrder('1', { from: user2 });
				});

				it('executes the trade and charges fees', async () => {
					let balance;
					balance = await exchange.balanceOf(token.address, user1);
					balance
						.toString()
						.should.eq(tokens(1).toString(), 'user1 received tokens');
					balance = await exchange.balanceOf(ETH_ADDRESS, user2);
					balance
						.toString()
						.should.eq(ether(1).toString(), 'user2 received ETH');
					balance = await exchange.balanceOf(ETH_ADDRESS, user1);
					balance.toString().should.eq('0', 'user2 ETH deducted');
					balance = await exchange.balanceOf(token.address, user2);
					balance
						.toString()
						.should.eq(
							tokens(0.9).toString(),
							'user2 tokens deducted with fee applied'
						);
					const feeAccount = await exchange.feeAccount();
					balance = await exchange.balanceOf(token.address, feeAccount);
					balance
						.toString()
						.should.eq(tokens(0.1).toString(), 'feeAccount received fee');
				});

				it('updates filled orders', async () => {
					const orderFilled = await exchange.orderFilled(1);
					orderFilled.should.eq(true);
				});

				it('emits a "Trade" event', async () => {
					const log = result.logs[0];
					log.event.should.eq('Trade');
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
					event.userFill.should.eq(user2, 'userFill is correct');
					event.timestamp
						.toString()
						.length.should.be.at.least(1, 'timestamp is present');
				});
			});

			describe('failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999;
					await exchange
						.fillOrder(invalidOrderId, { from: user2 })
						.should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects already-filled orders', async () => {
					await exchange.fillOrder('1', { from: user2 }).should.be.fulfilled;
					await exchange
						.fillOrder('1', { from: user2 })
						.should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects cancelled orders', async () => {
					await exchange.cancelOrder('1', { from: user1 }).should.be.fulfilled;
					await exchange
						.fillOrder('1', { from: user2 })
						.should.be.rejectedWith(EVM_REVERT);
				});
			});
		});

		describe('cancelling order', async () => {
			let result;

			describe('success', async () => {
				beforeEach(async () => {
					result = await exchange.cancelOrder('1', { from: user1 });
				});

				it('updates cancelled orders', async () => {
					const orderCancelled = await exchange.orderCancelled(1);
					orderCancelled.should.eq(true);
				});

				it('emits a "Cancel" event', async () => {
					const log = result.logs[0];
					log.event.should.eq('Cancel');
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

			describe('failure', async () => {
				it('rejects invalid order ids', async () => {
					const invalidOrderId = 99999;
					await exchange
						.cancelOrder(invalidOrderId, { from: user1 })
						.should.be.rejectedWith(EVM_REVERT);
				});

				it('rejects unauthorized cancellations', async () => {
					// Try to cancel the order from another user
					await exchange
						.cancelOrder('1', { from: user2 })
						.should.be.rejectedWith(EVM_REVERT);
				});
			});
		});
	});
});
