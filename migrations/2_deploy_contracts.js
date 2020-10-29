const TimesheetAccount = artifacts.require("TimesheetAccount");
const GenericProjectFactory = artifacts.require("GenericProjectFactory");

module.exports = function (deployer) {
  deployer.deploy(TimesheetAccount);
  deployer.deploy(GenericProjectFactory);
};
