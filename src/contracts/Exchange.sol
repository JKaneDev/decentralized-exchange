// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import './Token.sol';

// TODO:
// [X] Set The Fee Account
// [X] Deposit Ether
// [X] Withdraw Ether
// [X] Deposit Tokens
// [X] Withdraw Tokens
// [X] Check Balances
// [X] Make Order
// [X] Cancel Order
// [ ] Fill Order
// [ ] Charge Fees

contract Exchange {

    // Variables
    address public feeAccount; // the account that receives trading fees
    uint256 public feePercent;
    address constant ETH = address(0); // Store ETH in tokens mapping with blank address
    mapping(address => mapping(address => uint256)) public balances; // token => user address => amount held by user
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;
    
    // Events
    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address tokenReceived, uint256 amountReceived, address tokenGiven, uint256 amountGiven, uint256 timestamp);
    event Cancel(uint256 id, address user, address tokenReceived, uint256 amountReceived, address tokenGiven, uint256 amountGiven, uint256 timestamp);

    struct _Order {
        uint256 id;
        address user;
        address tokenReceived;
        uint256 amountReceived;
        address tokenGiven;
        uint256 amountGiven;
        uint256 timestamp;
    }

    // Store the order
    // Add the order to storage

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

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return balances[_token][_user];
    }

    function makeOrder(address _tokenReceived, uint256 _amountReceived, address _tokenGiven, uint256 _amountGiven) public {
        orderCount = orderCount += 1;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenReceived, _amountReceived, _tokenGiven, _amountGiven, block.timestamp);
        emit Order(orderCount, msg.sender, _tokenReceived, _amountReceived, _tokenGiven, _amountGiven, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender);
        require(_order.id == _id);
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenReceived, _order.amountReceived, _order.tokenGiven, _order.amountGiven, block.timestamp);
    }
}




