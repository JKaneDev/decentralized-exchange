// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Token {
    string public name = "X Token";
    string public symbol = 'XTK';
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;
    // Send Tokens

    constructor() public {
        totalSupply = 1000000 * (10 ** 18);
        balanceOf[msg.sender] = totalSupply;
    }
}