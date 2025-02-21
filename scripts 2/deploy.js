import pkg from 'hardhat';
const { ethers, run } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying TrustNet contract with account:", deployer.address);

  const TrustNet = await ethers.getContractFactory("TrustNet");
  const trustNet = await TrustNet.deploy();
  await trustNet.waitForDeployment();

  const address = await trustNet.getAddress();
  console.log("TrustNet deployed to:", address);

  // Unpause the contract
  const tx = await trustNet.unpause();
  await tx.wait();
  console.log("TrustNet contract unpaused");

  // Verify the contract on the Units Network explorer (if supported)
  try {
    await run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified on explorer");
  } catch (error) {
    console.log("Contract verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 