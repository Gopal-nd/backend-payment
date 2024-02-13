const express = require("express");

const app = express();
const cors = require("cors");
require("dotenv").config();


const port = 3001;
const ABI = require("./abi.json");

app.use(cors());
app.use(express.json());

function convertArrayToObjects(arr) {
  const dataArray = arr.map((transaction, index) => ({
    key: (arr.length + 1 - index).toString(),
    type: transaction[0],
    amount: transaction[1],
    message: transaction[2],
    address: `${transaction[3].slice(0,4)}...${transaction[3].slice(0,4)}`,
    subject: transaction[4],
  }));

  return dataArray.reverse();
}

app.get("/getNameAndBalance", async (req, res) => {
  const { userAddress } = req.query;

  const response = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x75BF0677485937846EE80cae7f57275945b6bdba",
    functionName: "getMyName",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponseName = response.raw;

  const secResponse = await Moralis.EvmApi.balance.getNativeBalance({
    chain: "0x13881",
    address: userAddress,
  });

  const jsonResponseBal = (secResponse.raw.balance / 1e18).toFixed(2);

  const thirResponse = await Moralis.EvmApi.token.getTokenPrice({
    address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  });

  const jsonResponseDollars = (
    thirResponse.raw.usdPrice * jsonResponseBal
  ).toFixed(2);

  const fourResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x75BF0677485937846EE80cae7f57275945b6bdba",
    functionName: "getMyHistory",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponseHistory = convertArrayToObjects(fourResponse.raw);


  const fiveResponse = await Moralis.EvmApi.utils.runContractFunction({
    chain: "0x13881",
    address: "0x75BF0677485937846EE80cae7f57275945b6bdba",
    functionName: "getMyRequests",
    abi: ABI,
    params: { _user: userAddress },
  });

  const jsonResponseRequests = fiveResponse.raw;


  const jsonResponse = {
    name: jsonResponseName,
    balance: jsonResponseBal,
    dollars: jsonResponseDollars,
    history: jsonResponseHistory,
    requests: jsonResponseRequests,
  };

  return res.status(200).json(jsonResponse);
});



Moralis.start({
  apiKey:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImIzYWY1NDMyLTAxNGQtNGZhMi1iMzlhLTk3MmYwMDM1ZmExNSIsIm9yZ0lkIjoiMzcyOTk5IiwidXNlcklkIjoiMzgzMzI4IiwidHlwZUlkIjoiY2RlMjk0ZDctYTRkMS00ZjBhLWFiMzYtYTNjMDk5MGFkOTZiIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDU1NzY0ODIsImV4cCI6NDg2MTMzNjQ4Mn0.aXH9f1S3VClDdb8kkgpxwnfTZ61_H4teGH0TEcs97sU',
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
