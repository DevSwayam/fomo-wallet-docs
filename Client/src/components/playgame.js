import React, { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import About from "./about";
import {
  betABI,
  betAddress,
  usdcContractABI,
  usdcContractAddress,
} from "@/utils/contracts";

const PlayGame = ({ chainid, betid, contractAddress }) => {
  // State management
  const [betAmount, setBetAmount] = useState("");
  const [email, setEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [txHash, setTxHash] = useState("");

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();

  // Contract write hooks
  const { writeContractAsync, error, isPending } = useWriteContract();

  // Transaction confirmation hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Constants
  const quickBets = [10, 20, 50, 100, 200, 500];

  // Handlers
  const handleQuickBet = (amount) => {
    setBetAmount(amount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!betAmount || !email || !twitter) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const amountInUSDC = parseUnits(betAmount.toString(), 18);
      console.log(betid, amountInUSDC, twitter, email)
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: betABI,
        functionName: "placeBet",
        args: [betid, amountInUSDC, twitter, email],
      });

      setTxHash(hash);

      // Reset form after successful submission
      if (isConfirmed) {
        setBetAmount("");
        setEmail("");
        setTwitter("");
        setTxHash("");
      }
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  // Network check render
  if (
    isConnected &&
    chainid !== undefined &&
    currentChainId.toString() !== chainid
  ) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">
                Wrong Network
              </h2>
              <p className="text-white mb-6 font-mono">
                Please switch to the correct network to continue
              </p>
              <ConnectButton.Custom>
                {({ openChainModal }) => (
                  <Button
                    onClick={openChainModal}
                    className="border-2 border-black bg-pink-500 text-white hover:bg-pink-600"
                  >
                    Switch Network
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
        <About />
      </div>
    );
  }

  // Wallet connection check render
  if (!isConnected) {
    return (
      <div className="pt-12">
        <div className="px-4 sm:px-16">
          <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">
                Connect Your Wallet
              </h2>
              <p className="text-white mb-6 font-mono">
                Please connect your wallet to start playing
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    className="border-2 border-black bg-pink-500 text-white hover:bg-pink-600"
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
        <About />
      </div>
    );
  }

  return (
    <div className="pt-12">
      <div className="px-4 sm:px-16">
        <div className="bg-purple-600 rounded-xl border-4 border-black shadow-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 overflow-hidden">
            {/* Left side - Betting Options */}
            <div className="border-b-4 sm:border-b-0 sm:border-r-4 border-black p-4 sm:p-8 bg-blue-500 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Betting Options
              </h2>
              <div className="space-y-4">
                <div className="bg-white border-2 border-black rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Quick Bets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {quickBets.map((amount) => (
                      <Button
                        key={amount}
                        onClick={() => handleQuickBet(amount)}
                        className={`border-black text-sm sm:text-base ${
                          parseInt(betAmount) === amount
                            ? "bg-white text-black"
                            : "bg-blue-500 text-white"
                        }`}
                        variant={
                          parseInt(betAmount) === amount ? "default" : "reverse"
                        }
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    Game Rules
                  </h3>
                  <ul className="space-y-1 sm:space-y-2 font-mono text-sm sm:text-base">
                    <li>• Minimum bet: $0</li>
                    <li>• Maximum bet: $1000</li>
                    <li>• Multiple bets allowed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right side - Place Bet */}
            <div className="p-4 sm:p-8 bg-pink-500 rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Place Your Bet
              </h2>
              <div className="bg-white border-2 border-black rounded-lg p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm sm:text-base">
                      Enter Bet Amount
                    </label>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full shadow-light border-black"
                      placeholder="Enter amount"
                      min="0"
                      max="1000"
                      disabled={isPending || isConfirming}
                    />
                  </div>

                  <div className="w-full flex items-center gap-4">
                    <div>
                      <label className="block mb-2 text-sm sm:text-base">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full shadow-light border-black"
                        placeholder="Enter your email"
                        disabled={isPending || isConfirming}
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm sm:text-base">
                        Twitter
                      </label>
                      <Input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full shadow-light border-black"
                        placeholder="@username"
                        disabled={isPending || isConfirming}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending || isConfirming}
                    className="w-full border-black bg-pink-500 text-white text-sm sm:text-base"
                  >
                    {isPending
                      ? "Confirming..."
                      : isConfirming
                        ? "Waiting for confirmation..."
                        : "Place Bet"}
                  </Button>

                  {txHash && (
                    <div className="text-sm text-gray-600 break-all">
                      Transaction Hash: {txHash}
                    </div>
                  )}

                  {isConfirmed && (
                    <div className="text-green-500 text-center text-sm">
                      Transaction confirmed. Bet placed successfully!
                    </div>
                  )}

                  {error && (
                    <div className="text-red-500 text-center text-sm">
                      Error: {error.shortMessage || error.message}
                    </div>
                  )}

                  <div className="text-black text-center text-sm sm:text-base font-bold font-mono">
                    Selected Amount: ${betAmount || "0"}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <About />
    </div>
  );
};

export default PlayGame;
