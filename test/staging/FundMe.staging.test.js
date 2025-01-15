const { assert } = require("chai");
const { network, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let deployerSigner;
          const sendValue = "1000000000000000000";

          beforeEach(async function () {
              await deployments.fixture(["all"]);

              deployer = (await getNamedAccounts()).deployer;
              deployerSigner = await ethers.getSigner(deployer);

              fundMe = await ethers.getContractAt(
                  "FundMe",
                  (await deployments.get("FundMe")).address,
                  deployerSigner,
              );
          });

          it("allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.target,
              );

              console.log(
                  endingFundMeBalance.toString() +
                      " should equal 0, running assert equal...",
              );

              assert.equal(endingFundMeBalance.toString(), "0");
          });
      });
