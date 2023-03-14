// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './Token.sol';

// TODO:
// [X] Set The Fee Account
// [X] Deposit Ether
// [ ] Withdraw Ether
// [X] Deposit Tokens
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
    mapping(address => mapping(address => uint256)) public balances; // token => user address => amount held by user
    
    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor (address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // Reverts if ETH is sent to this smart contract on accident
    fallback() external {
        revert();
    }

    function depositEther() payable public {
        balances[ETH][msg.sender] += msg.value;
        emit Deposit(ETH, msg.sender, msg.value, balances[ETH][msg.sender]);
    }

    function withdrawEther(uint _amount) public {
        require(balances[ETH][msg.sender] >= _amount);
        balances[ETH][msg.sender] -= _amount;
        // msg.sender.transfer(_amount);
        emit Withdraw(ETH, msg.sender, _amount, balances[ETH][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETH);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        balances[_token][msg.sender] += _amount; 
        emit Deposit(_token, msg.sender, _amount, balances[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != address(0));
        require(balances[_token][msg.sender] >= _amount);
        balances[_token][msg.sender] -= _amount;
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, balances[_token][msg.sender]);
    }
}




