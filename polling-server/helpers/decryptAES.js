import crypto from "crypto";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { getLitNodeClient, getEthersSigner } from "../utils.js";
import dotenv from "dotenv";

const litNodeClient = await getLitNodeClient();

dotenv.config();
const privateKey = process.env.PRIVATE_KEY;
const ethersSigner = getEthersSigner(privateKey);

const sessionSignatures = await litNodeClient.getSessionSigs({
  chain: "ethereum",
  expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
  resourceAbilityRequests: [
    {
      resource: new LitAccessControlConditionResource("*"),
      ability: LitAbility.AccessControlConditionDecryption,
    },
  ],
  authNeededCallback: async ({ uri, expiration, resourceAbilityRequests }) => {
    const toSign = await createSiweMessage({
      uri,
      expiration,
      resources: resourceAbilityRequests,
      walletAddress: await ethersSigner.getAddress(),
      nonce: await litNodeClient.getLatestBlockhash(),
      litNodeClient,
    });

    return await generateAuthSig({
      signer: ethersSigner,
      toSign,
    });
  },
});

export const decryptAES = async (encryptedData, hash, aesKey) => {
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

  console.log(`ℹ️  Decrypting data with hash: ${hash}`);
  console.log(`ℹ️  Encrypted data: ${encryptedData}`);

  const decryptionResponse = await litNodeClient.decrypt({
    chain: "ethereum",
    sessionSigs: sessionSignatures,
    encryptedData,
    hash,
    accessControlConditions,
  });

  console.log('ℹ️  Decryption response:', decryptionResponse);

  const decryptedString = new TextDecoder().decode(
    decryptionResponse.decryptedData
  );
  console.log(`ℹ️  decryptedString: ${decryptedString}`);
  return decryptedString;
};
