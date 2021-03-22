var BlockChainDM = artifacts.require("./BlockChainDM.sol");

module.exports = function(deployer) {
  deployer.deploy(BlockChainDM);
};
