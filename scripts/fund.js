const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContractAt("FundMe", deployer);
    console.log(`Got contract FundMe at ${fundMe.target}`);
    console.log("Funding contract...");
    const transactionResponse = await fundMe.fund({
        value: 0.1 ** 1e18,
        // ethers.utils.parseEther("0.1"),
    });
    await transactionResponse.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
