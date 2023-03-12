// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Token {
    using SafeMath for uint;

    // Variables
    string public name = "X Token";
    string public symbol = 'XTK';
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Track Balances
    mapping(address => uint256) public balanceOf;
    // Send Tokens

    constructor() public {
        totalSupply = 1000000 * (10 ** 18);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        return true;
    }
}