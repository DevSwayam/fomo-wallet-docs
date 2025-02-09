import { ethers, Wallet } from "ethers";
import axios from "axios";
import crypto from "crypto";
import { contractABI } from "../helpers/contractAbi.js";
import { callApiForCreatedBets } from "../helpers/callApiForCreatedbets.js";
import { storeBlob } from "../helpers/storeOnIPFS.js";
import { callApiForPlacedBets } from "../helpers/emailSenderForBets.js";
import { getEthersSigner, getLitNodeClient } from "../utils.js";
import dotenv from "dotenv";

dotenv.config();

// Event handler for "BetCreated"
export async function handleBetCreated(event) {
  try {
    const { betId, amount, hostTwitter } = event.args;

    // Log event args for debugging
    console.log("Event args:", event.args);

    console.log(`amount ${amount}`);
    // Manually convert amount from wei to ether
    const formattedAmount = Number(amount) / 1e18; // Convert from wei to ether
    console.log(`Bet Amount (in ether): ${formattedAmount}`);

    // Generate a random number in the range 1 to amount / 5
    const randomNumber = Math.floor(Math.random() * (formattedAmount / 5)) + 1;
    console.log(`Generated random number: ${randomNumber}`);

    let litNodeClient = await getLitNodeClient();
    const privateKey = process.env.PRIVATE_KEY;

    console.log(privateKey);

    const ethersSigner = getEthersSigner(privateKey);
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
    ];

    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: new TextEncoder().encode(randomNumber.toString()),
      accessControlConditions,
    });

    // AES encryption
    // const aesKey = "AGENT_KEY";
    // const iv = crypto.randomBytes(16);
    // const cipher = crypto.createCipheriv(
    //     "aes-256-cbc",
    //     crypto.createHash("sha256").update(aesKey).digest(),
    //     iv
    // );
    // let encrypted = cipher.update(randomNumber.toString(), "utf8", "hex");
    // encrypted += cipher.final("hex");

    // Prepare encrypted metadata
    const encryptedMetadata = {
      encryptedData: ciphertext,
      hash: dataToEncryptHash,
    };

    // Store metadata off-chain
    const blobId = await storeBlob(encryptedMetadata);
    if (!blobId) throw new Error("Failed to store blob.");

    // Mint NFT and activate the bet
    const tokenURI = blobId;
    const signer = new ethers.Wallet(
      privateKey,
      new ethers.JsonRpcProvider(process.env.RPC_URL)
    );
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      signer
    );
    console.log("Minting NFT and activating the bet...");

    // Call the secureBet function
    const tx = await contract.secureBet(betId, tokenURI);
    console.log(`Transaction submitted: ${tx.hash}`);

    // Call external API
    await callApiForCreatedBets({
      betId: betId.toString(),
      amount: formattedAmount,
      hostTwitter: hostTwitter,
    });
    console.log("API call completed successfully.");

    await tx.wait();
    console.log("Bet successfully secured and activated.");
  } catch (error) {
    console.error("Error handling BetCreated event:", error);
  }
}

// Other event handlers (if needed)
export async function handleBetActivated(event) {
  console.log("Handling BetActivated event:", event);
}

export async function handleBetPlaced(event) {
  console.log("Handling BetPlaced event:", event);
  await callApiForPlacedBets(event.args);
}

export async function handleBetClosed(event) {
  console.log("Handling BetClosed event:", event);
}

export async function handleBetCancelled(event) {
  console.log("Handling BetCancelled event:", event);
}
const eventhandlers = {
  BetCreated: handleBetCreated,
  BetActivated: handleBetActivated,
  BetPlaced: handleBetPlaced,
  BetClosed: handleBetClosed,
  BetCancelled: handleBetCancelled,
};

export default eventhandlers;

// module.exports = {
//   BetCreated: handleBetCreated,
//   BetActivated: handleBetActivated,
//   BetPlaced: handleBetPlaced,
//   BetClosed: handleBetClosed,
//   BetCancelled: handleBetCancelled,
// };
