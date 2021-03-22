pragma solidity >0.4.99 <0.6.0;

import "./Ownable.sol";

contract BlockChainDM is Ownable {
    struct Article {
        uint id;
        address payable seller;
        address buyer;
        string name;
        string content;
        uint256 price;
    }

    mapping(uint => Article) public data;
    uint dataCounter;
    address seller;
    address buyer;
    string name;
    string content;
    uint256 price;

    event LogSellData (
        uint indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price);

    event LogBuyData (
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price);


    function kill() public onlyOwner {
        selfdestruct(owner);
    }

    function sellData(string memory _name, string memory _content, uint256 _price) public {
        dataCounter++;

        data[dataCounter] = Article(
            dataCounter,
            msg.sender,
            address(0),
            _name,
            _content,
            _price
        );

        emit LogSellData(dataCounter, msg.sender, _name, _price);
    }

    function buyData(uint _id) public payable {

        require(dataCounter > 0, "No data instance found.");

        require(_id > 0 && _id <= dataCounter, "The specified ID does not belond to any data instance");

        Article storage dataInstance = data[_id];

        require(dataInstance.buyer == address(0), "This data has been sold");

        require(dataInstance.seller != msg.sender, "A user can not buy his own data");

        require(dataInstance.price == msg.value, "The price is not equal to the data value");

        dataInstance.buyer = msg.sender;

        dataInstance.seller.transfer(msg.value);

        emit LogBuyData(_id, dataInstance.seller, dataInstance.buyer, dataInstance.name, dataInstance.price);
    }

    function getNumberOfData() public view returns (uint) {
        return dataCounter;
    }

    function getIdsForData() public view returns (uint[]memory) {
        if(dataCounter == 0) {
            return new uint[](0);
        }

        uint[] memory dataIds = new uint[](dataCounter);

        uint numberOfArticlesForSale = 0;

        for (uint i = 1; i <= dataCounter; i++) {
            if (data[i].buyer == address(0)) {
                dataIds[numberOfArticlesForSale] = data[i].id;
                numberOfArticlesForSale++;
            }
        }

        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for (uint j = 0; j < numberOfArticlesForSale; j++) {
            forSale[j] = dataIds[j];
        }
        return forSale;
    }
}
