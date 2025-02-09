// utils/serverEncryption.js

import crypto from "crypto";

// A simple salt for encryption and decryption
const salt = "simpleSalt123";

// Encrypt a message
export function encryptMessage(message) {
  const cipher = crypto.createCipher("aes-256-cbc", salt);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16); // Generate a random Initialization Vector
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(salt, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Pack IV and ciphertext into a single string with a delimiter
  return `${iv.toString("hex")}|${encrypted}`;
}

export function decryptMessage(encryptedMessage) {
  const decipher = crypto.createDecipher("aes-256-cbc", salt);
  let decrypted = decipher.update(encryptedMessage, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
