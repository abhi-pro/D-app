var UniversityDegreeChain = artifacts.require("./UniversityDegreeChain.sol");

module.exports = function(deployer) {
  deployer.deploy(UniversityDegreeChain);
};
