var solc = require("solc");
const path = require("path");
const fs = require("fs");

const contractPath = path.resolve(__dirname, "contracts", "BuyMeACoffee.sol");
const contract = fs.readFileSync(contractPath, "utf8");

var input = {
  language: "Solidity",
  sources: { "BuyMeACoffee.sol": { content: contract } },
  settings: { outputSelection: { "*": { "*": ["*"] } } },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

for (var contractName in output.contracts["BuyMeACoffee.sol"]) {
  console.log("contractName: ", contractName);
  console.log(
    "bytecode: ",
    output.contracts["BuyMeACoffee.sol"][contractName].evm.bytecode.object
  );
  console.log(
    "deployedBytecode: ",
    output.contracts["BuyMeACoffee.sol"][contractName].evm.deployedBytecode
      .object
  );
  console.log("abi :", output.contracts["BuyMeACoffee.sol"][contractName].abi);
}
