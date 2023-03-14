// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './Token.sol';

// TODO:
// [X] Set The Fee Account
// [ ] Deposit Ether
// [ ] Withdraw Ether
// [ ] Deposit Tokens
// [ ] Withdraw Tokens
// [ ] Check Balances
// [ ] Make Order
// [ ] Cancel Order
// [ ] Fill Order

contract Exchange {

    // Variables
    address public feeAccount; // the account that receives trading fees
    uint256 public feePercent;
    address constant ETH = address(0); // Store ETH in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public tokens; // token => user address => amount held by user
    
    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositEther() payable public {
        tokens[ETH][msg.sender] += msg.value;
        emit Deposit(ETH, msg.sender, msg.value, tokens[ETH][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        // TODO: Don't allow ETH deposits
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] += _amount; 
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
}




