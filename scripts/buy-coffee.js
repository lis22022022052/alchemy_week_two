// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

//Returns the Ethere balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

//Logs the Ether blances for a list of addresses.
async function printBlances(addresses) {
  let idx = 0;
  for (const anddress of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(anddress));
    idx++;
  }
}

//Logs the memos stored on-chain from coffe purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;

    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  // Get example account.
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get the contract to deploy and deploy.
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to ", buyMeACoffee.address);

  // Check balances before the coffee purchase.
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("-- start --");
  await printBlances(addresses);

  // Buy the owner a few coffess.
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeACoffee
    .connect(tipper)
    .buyCoffee("Carolina", "You are the best", tip);
  await buyMeACoffee
    .connect(tipper2)
    .buyCoffee("Vitto", "Amazing teaxher:)", tip);
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee("Kay", "I lov my Proof of Knowledge NFT", tip);

  // Check balances after coffee purchase.
  console.log("-- bought coffee --");
  await printBlances(addresses);

  // Withdraw funds.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balance after withdraw.
  console.log("-- withdrawTips --");
  await printBlances(addresses);

  // Read all the memos left from the owner.
  console.log("-- memos --");
  printMemos(await buyMeACoffee.getMemos());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
