/* eslint no-use-before-define: "warn" */
const parcel0 = require("./data.json");
const { ethers } = require("hardhat");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const delayMS = 2000;

const main = async () => {
  // ADDRESS TO MINT TO:
  const toAddress = "0xb40A70Aa5C30215c44F27BF990cBf4D3E5Acb384"; // this will be the temporary address to hold the plots on testnets, in practice will be owned by CityDAO

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = await getNamedAccounts();
  const parcelContract = await ethers.getContract("CityDaoParcel", deployer);

  try {
    const uploaded = await ipfs.add(JSON.stringify({ plots: parcel0.plots }));
    await parcelContract.setMetadata(uploaded.path);
    console.log(`Posting IPFS hash (${uploaded.path})`);
    let idx = 0;
    for (const plot of parcel0.plots) {
      await listPlot(plot, idx, parcelContract);
      await sleep(delayMS);
      idx++;
    }
    await parcelContract.transferOwnership(toAddress, {
      gasLimit: 400000,
    });
  } catch (err) {
    console.log(err);
  }

  // transfer contract to CityDAO
  console.log(
    "Transferring ownership of CityDAO Plot Contract to " + toAddress + "..."
  );

  console.log("\n\n 🎫 Done!\n");
  console.log(await parcelContract.getPlotIds());

  await sleep(delayMS);
};

async function listPlot(plot, idx, contract) {
  console.log(`Uploading plot${idx}...`);

  const res = await contract.listPlot(
    ethers.BigNumber.from(`${100000000000000000 * (idx + 1)}`),
    {
      gasLimit: 400000,
    }
  );
  await sleep(delayMS);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
