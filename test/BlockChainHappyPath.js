const BlockChainDM = artifacts.require("./BlockChainDM.sol");

contract('BlockChainDM', function (accounts) {

    let dataInstance;

    const seller = accounts[1];
    const buyer = accounts[2];

    const nameData1 = "Data Instance 1";
    const contentData1 = "Content of Data Instance 1";
    const priceData1 = web3.utils.toBN(10);

    const nameData2 = "Data Instance 1";
    const contentData2 = "Content of Data Instance 1";
    const priceData2 = web3.utils.toBN(20);

    let sellerBalanceBeforeBuy, sellerBalanceAfterBuy;
    let buyerBalanceBeforeBuy, buyerBalanceAfterBuy;

    before("Every test should have a contract initiated", async () => {
        dataInstance = await BlockChainDM.deployed();

    });

    it("Make sure we have empty values at first", async () => {
        const dataInstancesNumber = await dataInstance.getNumberOfData();
        assert.equal(dataInstancesNumber, 0, "data instances number should be equal to 0");

        const dataForSale = await dataInstance.getIdsForData();
        assert.equal(dataForSale.length, 0, "There should not be any data for sale");

    });

    it("User should be able to sell his/her first data instance", async () => {
        const receipt = await dataInstance.sellData(
            nameData1,
            contentData1,
            web3.utils.toWei(priceData1, "ether"),
            {
                from: seller
            }
        );

        assert.equal(receipt.logs.length, 1, "An event should be created");
        assert.equal(receipt.logs[0].event, "LogSellData", "The name of the event should be equal to LogSellData");
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "The id should be equal to 1");
        assert.equal(receipt.logs[0].args._seller, seller, "seller should be " + seller);
        assert.equal(receipt.logs[0].args._name, nameData1, "the name of the data instance should be " + nameData1);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(priceData1, "ether").toString(), "the price of the data instance should be " + web3.utils.toWei(priceData1, "ether"));

        const dataInstancesNumber = await dataInstance.getNumberOfData();
        assert.equal(dataInstancesNumber, 1, "data instances number should be one");

        const dataForSale = await dataInstance.getIdsForData();
        assert.equal(dataForSale.length, 1, "Should be one data instance for sale");

        const dataId = dataForSale[0].toNumber();
        assert.equal(dataId, 1, "The id of the data instance should be equal to 1");

        const data = await dataInstance.data(dataId);
        assert.equal(data[0].toNumber(), 1, "The id should be equal to 1");
        assert.equal(data[1], seller, "seller should be " + seller);
        assert.equal(data[2], 0x0, "buyer should be empty");
        assert.equal(data[3], nameData1, "the name of the data instance should be " + nameData1);
        assert.equal(data[4], contentData1, "the content of the data instance should be " + contentData1);
        assert.equal(data[5].toString(), web3.utils.toWei(priceData1, "ether").toString(), "the price of the data instance should be " + web3.utils.toWei(priceData1, "ether"));

    });

    it("User should be able to sell his/her second data instance", async () => {
        const receipt = await dataInstance.sellData(
            nameData2,
            contentData2,
            web3.utils.toWei(priceData2, "ether"), {
                from: seller
            }
        );

        assert.equal(receipt.logs.length, 1, "An event should be created");
        assert.equal(receipt.logs[0].event, "LogSellData", "The name of the event should be equal to LogSellData");
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "The id should be equal to 2");
        assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
        assert.equal(receipt.logs[0].args._name, nameData2, "The event data instance name should be " + nameData2);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(priceData2, "ether").toString(), "event price of the data instance should be " + web3.utils.toWei(priceData2, "ether"));

        const dataInstancesNumber = await dataInstance.getNumberOfData();
        assert.equal(dataInstancesNumber, 2, "The data instances number should be 2");

        const dataForSale = await dataInstance.getIdsForData();
        assert.equal(dataForSale.length, 2, "he data instances for sale should be 2");

        const dataId = dataForSale[1].toNumber();
        assert.equal(dataId, 2, "The id should be equal to 2");

        const data = await dataInstance.data(dataId);
        assert.equal(data[0].toNumber(), 2, "The data id should be equal to 2");
        assert.equal(data[1], seller, "seller should be " + seller);
        assert.equal(data[2], 0x0, "Buyer should not be specified yet");
        assert.equal(data[3], nameData2, "The name of the data instance should be " + nameData2);
        assert.equal(data[4], contentData2, "The content of the data instance should be " + contentData2);
        assert.equal(data[5].toString(), web3.utils.toWei(priceData2, "ether").toString(), "the price of the data instance should be " + web3.utils.toWei(priceData2, "ether"));

    });

    it("User should be able to buy his/her second data instance", async () => {
        const dataId = 1;

        sellerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
        buyerBalanceBeforeBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));

        const receipt = await dataInstance.buyData(dataId, {
            from: buyer,
            value: web3.utils.toWei(priceData1, "ether")
        });

        assert.equal(receipt.logs.length, 1, "An event should be created");
        assert.equal(receipt.logs[0].event, "LogBuyData", "The name of the event should be equal to LogBuyData");
        assert.equal(receipt.logs[0].args._id.toNumber(), dataId, "The id should be equal to " + dataId);
        assert.equal(receipt.logs[0].args._seller, seller, "event seller should be " + seller);
        assert.equal(receipt.logs[0].args._buyer, buyer, "event buyer should be " + buyer);
        assert.equal(receipt.logs[0].args._name, nameData1, "The event data instance name should be " + nameData1);
        assert.equal(receipt.logs[0].args._price.toString(), web3.utils.toWei(priceData1, "ether").toString(), "event price of the data instance should be " + web3.utils.toWei(priceData1, "ether"));

        sellerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(seller), "ether"));
        assert(sellerBalanceAfterBuy == sellerBalanceBeforeBuy + priceData1.toNumber(), "seller should have earned " + priceData1 + " ETH");

        buyerBalanceAfterBuy = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(buyer), "ether"));
        assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - priceData1.toNumber(), "buyer should have spent " + priceData1 + " ETH");

        const data = await dataInstance.data(dataId);

        assert.equal(data[0].toNumber(), 1, "The id should be equal to 1");
        assert.equal(data[1], seller, "seller should be " + seller);
        assert.equal(data[2], buyer, "buyer should be " + buyer);
        assert.equal(data[3], nameData1, "The name of the data instance should be " + nameData1);
        assert.equal(data[4], contentData1, "The content of the data instance should be " + contentData1);
        assert.equal(data[5].toString(), web3.utils.toWei(priceData1, "ether").toString(), "the price of the data instance should be " + web3.utils.toWei(priceData1, "ether"));

        const dataForSale = await dataInstance.getIdsForData();

        assert(dataForSale.length, 1, "Only one data instance should be left for sale");

    });
});
