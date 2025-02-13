import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_RPC, LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";


export const getEnv = (name) => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

export const getEthersSigner = (ethereumPrivateKey) => {
  return new ethers.Wallet(
    ethereumPrivateKey,
    new ethers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
  );
};

export const getLitNodeClient = async () => {
  const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: true,
  });
  await litNodeClient.connect();
  return litNodeClient;
};
