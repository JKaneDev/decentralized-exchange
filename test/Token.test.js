import { tokens } from '../src/helpers';

const Token = artifacts.require('./Token');
require('chai').use(require('chai-as-promised')).should();

contract('Token', ([deployer, sender, receiver]) => {
	let token;
	let name = 'X Token';
	let symbol = 'XTK';
	let decimals = '18';
	let totalSupply = tokens(1000000).toString(); // 1 million

	beforeEach(async () => {
		token = await Token.new();
	});

	describe('deployment', () => {
		it('tracks the name', async () => {
			const result = await token.name();
			result.should.equal(name);
		});

		it('tracks the symbol', async () => {
			const result = await token.symbol();
			result.should.equal(symbol);
		});

		it('tracks the decimals', async () => {
			const result = await token.decimals();
			result.toString().should.equal(decimals);
		});

		it('tracks the total supply', async () => {
			const result = await token.totalSupply();
			result.toString().should.equal(totalSupply.toString());
		});

		it('assigns the total supply to the deployer', async () => {
			const result = await token.balanceOf(deployer);
			result.toString().should.equal(totalSupply.toString());
		});
	});

	describe('sending tokens', () => {
		let amount;
		let result;

		beforeEach(async () => {
			amount = tokens(100);
			result = await token.transfer(receiver, amount, { from: deployer });
		});
		it('transfers token balances', async () => {
			let balanceOf;
			// Transfer
			await token.transfer(receiver, tokens(100), {
				from: deployer,
			});
			// After Transfer
			balanceOf = await token.balanceOf(deployer);
			balanceOf.toString().should.equal(tokens(999900).toString());
			console.log('receiver balance after transfer: ', balanceOf.toString());
			balanceOf = await token.balanceOf(receiver);
			balanceOf.toString().should.equal(tokens(100).toString());
			console.log('deployer balance after transfer: ', balanceOf.toString());
		});

		it('emits a transfer event', async () => {
			console.log(result);
		});
	});
});
