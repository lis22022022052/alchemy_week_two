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
async function printBlances(addresses, ownerAddress, newOwnerAddress) {
  let idx = 0;
  console.log(
    `New Owner address balance: ${await getBalance(
      newOwnerAddress
    )} (${newOwnerAddress})`
  );
  console.log(
    `Owner address balance: ${await getBalance(ownerAddress)} (${ownerAddress})`
  );
  for (const anddress of addresses) {
    console.log(
      `Address ${idx} balance: ${await getBalance(anddress)} (${anddress})`
    );
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
  const [owner, tipper, tipper2, tipper3, newOwner] =
    await hre.ethers.getSigners();

  // Get the contract to deploy and deploy.
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACoffee deployed to ", buyMeACoffee.address);

  // Check balances before the coffee purchase.
  const addresses = [tipper.address, tipper2.address, tipper3.address];
  console.log("-- start --");
  await printBlances(addresses, owner.address, newOwner.address);

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
  console.log("-- bought coffee (Carolina, Vitto, Kay)--");
  await printBlances(addresses, owner.address, newOwner.address);

  // Withdraw funds.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balance after withdraw.
  console.log("-- withdrawTips --");
  await printBlances(addresses, owner.address, newOwner.address);

  // Read all the memos left from the owner.
  console.log("-- memos --");
  printMemos(await buyMeACoffee.getMemos());

  console.log("-- set the new owner --");
  // Show the current owner address
  console.log(
    `The current owner address: ${await buyMeACoffee.getOwnerAddress()}`
  );

  // Update current owner address
  await buyMeACoffee.transferOwnership(newOwner.address);

  //Show the new current owner address
  console.log(
    `The new current owner address: ${await buyMeACoffee.getOwnerAddress()}`
  );
  // Buy the owner a few coffess.
  await buyMeACoffee
    .connect(tipper3)
    .buyCoffee("Kay", "I lov my Proof of Knowledge NFT", tip);

  // Withdraw funds.
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after coffee purchase.
  console.log("-- bought coffee (Kay)--");
  await printBlances(addresses, owner.address, newOwner.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
