import { Alchemy, Network } from "alchemy-sdk";
import { useEffect, useState } from "react";

import "./App.css";

const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [NFTfloorPrice, setNFTfloorPrice] = useState();
  const [NFT, setNFT] = useState();
  const [blockList, setBlockList] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blockNumber, setBlockNumber] = useState();
  const [details, setDetails] = useState();
  const [gasPrice, setGasPrice] = useState();
  const [txReceipt, setTxReceipt] = useState();

  useEffect(() => {
    async function getBlockData() {
      const currentBlockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(currentBlockNumber);
      const lastTenBlocks = [];
      for (let i = 1; i < 11; i++) {
        const prevBlock = await alchemy.core.getBlock(currentBlockNumber - i);
        lastTenBlocks.push(prevBlock.number);
      }
      setBlockList(lastTenBlocks);
      const blockDetails = await alchemy.core.getBlock(currentBlockNumber);
      setDetails(blockDetails);
      const currentGasPrice = await alchemy.core.getGasPrice();
      setGasPrice(currentGasPrice);
      const firstTx = blockDetails?.transactions?.[0];
      // console.log(firstTx);
      const txInfo = await alchemy.core.getTransactionReceipt(firstTx);
      // console.log(txInfo.gasUsed._hex);
      setTxReceipt(txInfo);
      let NFTcontractAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";
      let NFTtokenId = "3478";
      const NFTmetaData = await alchemy.nft.getNftMetadata(
        NFTcontractAddress,
        NFTtokenId
      );
      console.log(NFTmetaData);
      setNFT(NFTmetaData);
      const fPrice = await alchemy.nft.getFloorPrice(NFTcontractAddress);
      console.log(fPrice.openSea.floorPrice);
      setNFTfloorPrice(fPrice);
    }

    getBlockData();
  }, []);

  const handleBlockClick = async (blockNumber) => {
    const blockDetails = await alchemy.core.getBlock(blockNumber);
    setSelectedBlock(blockDetails);
  };

  const handleReturnToHomepage = () => {
    // Reset the selected block state to null to return to the homepage
    setSelectedBlock(null);
  };

  let transactionsToShow = [];
  if (details && details.transactions) {
    transactionsToShow = details.transactions.slice(0, 5);
  }

  // Helper function to convert gas price from wei to ether
  const convertWeiToGwei = (wei) => {
    const gweiValue = parseFloat(wei) / Math.pow(10, 9);
    return gweiValue.toFixed(0); // Display up to 6 decimal places
  };

  const formatObjectToString = (obj) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  return (
    <>
      <div className="App">
        <button onClick={handleReturnToHomepage}>Return to Homepage</button>
      </div>
      <div className="App">
        Gas Price:{" "}
        {gasPrice ? convertWeiToGwei(gasPrice.toString()) : "Loading..."} gwei
      </div>
      <div className="App">
        Last 10 Blocks:
        <br></br>
        {"(Click on a block number you want to see the details!)"}
        {blockList
          ? blockList.map((ele) => (
              <div key={ele} onClick={() => handleBlockClick(ele)}>
                <span
                  className={
                    selectedBlock && selectedBlock.number === ele
                      ? "selected-block"
                      : ""
                  }
                >
                  {ele}
                </span>
              </div>
            ))
          : "Loading..."}
      </div>
      <div className="App">
        Current Block: {blockNumber ? blockNumber : "..."}
      </div>
      {selectedBlock && (
        <div className="App">
          Selected Block Details: Block Number {selectedBlock.number}
          <pre>{JSON.stringify(selectedBlock, null, 2)}</pre>
        </div>
      )}

      <br></br>
      <div className="App">
        Last 5 transactions of the Current Block:{" "}
        <pre>
          {transactionsToShow.join("\n")}
          {details?.transactions?.length > 5 && (
            <>
              {"\n"}
              {`+${details.transactions.length - 5} more...`}
            </>
          )}
        </pre>
      </div>
      {/* <div className="App">
        Info of 1st tx: {" "}
        <pre>
          {txReceipt ? formatObjectToString(txReceipt) : 'Loading...'}
        </pre>
        <br></br>
        </div> */}
      <div className="App">Info of 1st tx: </div>
      <div className="App">
        txHash: {txReceipt ? JSON.stringify(txReceipt.transactionHash) : "..."}
      </div>
      <div className="App">
        to: {txReceipt ? JSON.stringify(txReceipt.to) : "..."}
      </div>
      <div className="App">
        from: {txReceipt ? JSON.stringify(txReceipt.from) : "..."}
      </div>
      <div className="App">
        gasUsed:{" "}
        {txReceipt ? parseInt(txReceipt.gasUsed._hex).toString() : "..."}
      </div>
      <br></br>
      <div className="App">
        BAYC floor price:{" "}
        {NFTfloorPrice
          ? `${NFTfloorPrice.openSea.floorPrice} ETH`
          : "Loading..."}
      </div>
      <br></br>
      <div className="App">
        BAYC 3478 Metadata:
        <br></br>
        <br></br>
        {NFT ? JSON.stringify(NFT.rawMetadata.attributes) : "Loading..."}
      </div>
    </>
  );
}

export default App;
