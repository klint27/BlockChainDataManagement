pragma solidity >0.4.99 <0.6.0;

contract Ownable {

    address payable owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }
}
