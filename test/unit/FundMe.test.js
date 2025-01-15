const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");

describe("FundMe", async function () {
    let fundMe;
    let deployer;
    let mockV3Aggregator;
    let deployerSigner;
    const sendValue = "1000000000000000000";
    // const sendValue = ethers.utils.parseEther("1"); // 1 ETH
    // console.log("Parsed Ether:", sendValue.toString());

    beforeEach(async function () {
        // can use accounts instead of deployer
        // const accounts = await ethers.getSigners();
        // const accountZero = accounts[0];
        await deployments.fixture(["all"]);

        deployer = (await getNamedAccounts()).deployer;
        deployerSigner = await ethers.getSigner(deployer);

        fundMe = await ethers.getContractAt(
            "FundMe",
            (await deployments.get("FundMe")).address,
            deployerSigner,
        );
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            (await deployments.get("MockV3Aggregator")).address,
            deployerSigner,
        );
    });

    describe("constructor", async function () {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed();
            const address = await mockV3Aggregator.getAddress();
            assert.equal(response, address);
        });
    });

    describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!",
            );
        });

        it("updates the amount funded data structure", async function () {
            await fundMe.fund({ value: sendValue });

            const response =
                await fundMe.getAddressToAmountFunded(deployerSigner);
            assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of funders", async function () {
            await fundMe.fund({ value: sendValue });
            const funder = await fundMe.getFunder(0);
            assert.equal(funder, deployer);
        });
    });

    describe("withdraw", async function () {
        beforeEach(async function () {
            await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH from a single founder", async function () {
            // Arrange

            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );

            const startingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            // Act
            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasUsed * gasPrice;

            const endingFunfMrBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            // Assert
            assert.equal(endingFunfMrBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            );
        });

        it("allows us to withdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );

            const startingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            const transactionResponse = await fundMe.withdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasUsed * gasPrice;

            const endingFunfMrBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            // Assert
            assert.equal(endingFunfMrBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            );

            // Make sure funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0,
                );
            }
        });

        it("allows us to cheaperWithdraw with multiple funders", async function () {
            const accounts = await ethers.getSigners();
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i],
                );
                await fundMeConnectedContract.fund({ value: sendValue });
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target,
            );

            const startingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            const transactionResponse = await fundMe.cheaperWithdraw();
            const transactionReceipt = await transactionResponse.wait(1);
            const { gasUsed, gasPrice } = transactionReceipt;
            const gasCost = gasUsed * gasPrice;

            const endingFunfMrBalance = await ethers.provider.getBalance(
                fundMe.target,
            );
            const endingDeployerBalance =
                await ethers.provider.getBalance(deployerSigner);

            // Assert
            assert.equal(endingFunfMrBalance, 0);
            assert.equal(
                (startingFundMeBalance + startingDeployerBalance).toString(),
                (endingDeployerBalance + gasCost).toString(),
            );

            // Make sure funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted;
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0,
                );
            }
        });

        it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners();
            const attacker = accounts[1];
            const fundMeConnectedContract = await fundMe.connect(attacker);
            // const withd = await fundMeConnectedContract.withdraw();
            // await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith(
            //     "FundMe__NotOwner",
            // );
            await expect(
                fundMeConnectedContract.withdraw(),
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
    });
});
