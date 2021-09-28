/* eslint no-use-before-define: "warn" */
const { ethers } = require("hardhat");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const delayMS = 1000; //sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {
  // ADDRESS TO MINT TO:
  const toAddress = "0xb40A70Aa5C30215c44F27BF990cBf4D3E5Acb384"; // this will be the temporary address to hold the plots on testnets, in practice will be owned by CityDAO

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = await getNamedAccounts();
  const plot = await ethers.getContract("CityDaoParcel", deployer);

  const plot0 = {
    geojson: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-106.32980346679687, 43.17263460564885],
            [-106.32843017578125, 43.14809207007617],
            [-106.29615783691406, 43.14458518880386],
            [-106.2604522705078, 43.19666671417641],
            [-106.31263732910156, 43.212182422791194],
            [-106.32980346679686, 43.17263460564885],
          ],
        ],
      },
    },
  };
  console.log("Uploading plot0...");
  const uploaded = await ipfs.add(JSON.stringify(plot0));

  console.log("Listing plot0 with IPFS hash (" + uploaded.path + ")");
  await plot.listPlot(uploaded.path, "0.01", {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const plot1 = {
    geojson: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-106.31881713867189, 43.213683733553026],
            [-106.34902954101562, 43.22369152747339],
            [-106.35795593261719, 43.20867922062144],
            [-106.34696960449219, 43.182148446530114],
            [-106.33941650390625, 43.17313537107136],
            [-106.33529663085938, 43.17513839170044],
            [-106.31881713867188, 43.213683733553026],
          ],
        ],
      },
    },
  };
  console.log("Uploading plot1...");
  const uploadedplot1 = await ipfs.add(JSON.stringify(plot1));

  console.log("Listing plot1 with IPFS hash (" + uploadedplot1.path + ")");
  await plot.listPlot(uploadedplot1.path, "0.01", {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  const plot2 = {
    geojson: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-106.36276245117189, 43.204675314614],
            [-106.3861083984375, 43.203173782105814],
            [-106.37786865234375, 43.15360247702298],
            [-106.34078979492188, 43.144084189341605],
            [-106.33804321289061, 43.1596132634395],
            [-106.35314941406249, 43.18064635967524],
            [-106.36276245117188, 43.204675314614],
          ],
        ],
      },
    },
  };
  console.log("Uploading plot2...");
  const uploadedplot2 = await ipfs.add(JSON.stringify(plot2));

  console.log("Listing plot2 with IPFS hash (" + uploadedplot2.path + ")");
  await plot.listPlot(uploadedplot2.path, "0.01", {
    gasLimit: 400000,
  });

  await sleep(delayMS);

  // transfer contract to CityDAO
  console.log(
    "Transferring ownership of CityDAO Plot Contract to " + toAddress + "..."
  );

  await plot.transferOwnership(toAddress);

  await sleep(delayMS);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });