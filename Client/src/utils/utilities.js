const encryptMessage = async (address) => {
  try {
    if (!message.trim()) {
      throw new Error("Please enter a message to encrypt");
    }

    // Get the encryption public key for the address
    const encryptionPublicKey = await window.ethereum.request({
      method: "eth_getEncryptionPublicKey",
      params: [address],
    });

    setEncryptedData({
      publicKey: encryptionPublicKey,
      message: message,
      recipientAddress: address,
    });
  } catch (err) {
    setError(
      err.message ||
        "Encryption failed. Make sure you have enabled account encryption in MetaMask."
    );
  } finally {
    setIsLoading(false);
  }
};
