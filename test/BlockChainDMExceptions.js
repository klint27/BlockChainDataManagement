const BlockChainDM = artifacts.require("./BlockChainDM.sol");

contract('BlockChainDM', function (accounts) {

    let dataInstance;
    const seller = accounts[1];
    const buyer = accounts[2];
    const id = 1;
    const dataName = "Data Instance 1";
    const dataContent = "Content of Data Instance 1";
    const dataPrice = web3.utils.toBN(10);

    before("set up contract instance for each test", async () => {
        dataInstance = await BlockChainDM.deployed();

    });

    it("You can not buy data, if there is not any data for sale", async () => {
        try {
            await dataInstance.buyData(id, {
                from: buyer,
                value: web3.utils.toWei(dataPrice, "ether")
            });

            assert.fail();

        } catch(error) {
            assert.equal(error.reason, "No data instance found.");

        }

        const numberOfData = await dataInstance.getNumberOfData();

        assert.equal(numberOfData.toNumber(), 0, "There should be 0 data instances.");

    });

    it("You can not buy non-existant data", async () => {
        await dataInstance.sellData(
            dataName,
            dataContent,
            web3.utils.toWei(dataPrice, "ether"), {
                from: seller
            }

        );

        try {
            await dataInstance.buyData(2, {
                from: seller,
                value: web3.utils.toWei(dataPrice, "ether")
            });

            assert.fail();

        } catch(error) {
            assert.equal(error.reason, "The specified ID does not belond to any data instance");

        }

        const data = await dataInstance.data(id);

        assert.equal(data[0].toNumber(), id, "data id should be " + id);
        assert.equal(data[1], seller, "Incorrect seller, it should be " + seller);
        assert.equal(data[2], 0x0, "Buyer should not be specified yet.");
        assert.equal(data[3], dataName, "The name of the data instance should be " + dataName);
        assert.equal(data[4], dataContent, "The content of this data should be " + dataContent);
        assert.equal(data[5].toString(), web3.utils.toWei(dataPrice, "ether").toString(), "The price of this data instance should be " + web3.utils.toWei(dataPrice, "ether"));
      });

    it("A user should not be able to buy his/her own data", async () => {
        try {
            await dataInstance.buyData(id, {
                from: seller,
                value: web3.utils.toWei(dataPrice, "ether")
            });

            assert.fail();

        } catch(error) {
            assert.equal(error.reason, "A user can not buy his own data");

        }

        const data = await dataInstance.data(id);

        assert.equal(data[0].toNumber(), id, "data id should be " + id);
        assert.equal(data[1], seller, "Incorrect seller, it should be " + seller);
        assert.equal(data[2], 0x0, "Buyer should not be specified yet");
        assert.equal(data[3], dataName, "The name of the data instance should be " + dataName);
        assert.equal(data[4], dataContent, "The content of this data should be " + dataContent);
        assert.equal(data[5].toString(), web3.utils.toWei(dataPrice, "ether").toString(), "The price of this data instance should be " + web3.utils.toWei(dataPrice, "ether"));
      });

    it("The data value should be equal to its price", async () => {
        try {
            await dataInstance.buyData(id, {
                from: buyer,
                value: web3.utils.toWei(dataPrice + 1, "ether")
            });

        } catch(error) {
            assert.equal(error.reason, "The price is not equal to the data value");

        }

        const data = await dataInstance.data(id);

        assert.equal(data[0].toNumber(), id, "data id should be " + id);
        assert.equal(data[1], seller, "Incorrect seller, it should be " + seller);
        assert.equal(data[2], 0x0, "Buyer should not be specified yet.");
        assert.equal(data[3], dataName, "The name of the data instance should be " + dataName);
        assert.equal(data[4], dataContent, "The content of this data should be " + dataContent);
        assert.equal(data[5].toString(), web3.utils.toWei(dataPrice, "ether").toString(), "The price of this data instance should be " + web3.utils.toWei(dataPrice, "ether"));
      });

    it("A data can not be sold more than once with the same id", async () => {
        await dataInstance.buyData(id, {
            from: buyer,
            value: web3.utils.toWei(dataPrice, "ether")
        });

        try {
            await dataInstance.buyData(id, {
                from: accounts[0],
                value: web3.utils.toWei(dataPrice, "ether")
            });

            assert.fail();

        } catch(error) {
            assert.equal(error.reason, "This data has been sold");

        }

        const data = await dataInstance.data(id);

        assert.equal(data[0].toNumber(), id, "data id should be " + id);
        assert.equal(data[1], seller, "Incorrect seller, it should be " + seller);
        assert.equal(data[2], buyer, "Buyer should not be specified yet" + buyer);
        assert.equal(data[3], dataName, "The name of the data instance should be " + dataName);
        assert.equal(data[4], dataContent, "The content of this data should be " + dataContent);
        assert.equal(data[5].toString(), web3.utils.toWei(dataPrice, "ether").toString(), "The price of this data instance should be " + web3.utils.toWei(dataPrice, "ether"));
    });

});
