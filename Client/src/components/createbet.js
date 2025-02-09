import React, { useState } from "react";
import { useWriteContract, useWatchContractEvent } from "wagmi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  betABI,
  betAddress,
  usdcContractABI,
  usdcContractAddress,
} from "@/utils/contracts";
import { SignJWT, jwtVerify } from "jose";
import { parseUnits } from "viem";

const CreateBetSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [hostTwitter, setHostTwitter] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { writeContractAsync } = useWriteContract();

  useWatchContractEvent({
    address: betAddress,
    abi: betABI,
    eventName: "BetCreated",
    onLogs(logs) {
      console.log(logs);
      setIsSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        setIsOpen(false);
        // Reset form
        setAmount("");
        setDays("");
        setHours("");
        setMinutes("");
        setHostTwitter("");
        setEncryptedKey("");
        setEmail("");
        setIsSuccess(false);
      }, 2000);
    },
  });

  async function createToken(data) {
    const secretKey = new TextEncoder().encode("your-secret-key");
    const token = await new SignJWT({ data })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("70h")
      .sign(secretKey);
    return token;
  }

  const handleMintAndApprove = async () => {
    setIsLoading(true);
    try {
      await writeContractAsync({
        address: usdcContractAddress,
        abi: usdcContractABI,
        functionName: "mintAndApprove",
        args: [betAddress],
      });
    } catch (error) {
      console.error("Error minting and approving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = await createToken(encryptedKey);
      
      // Convert USDC amount to the correct decimals (6 decimals for USDC)
      const amountInUSDC = parseUnits(amount.toString(), 18);
      
      // Calculate total seconds from days, hours and minutes
      const totalSeconds = (
        (parseInt(days) * 24 * 3600) + 
        (parseInt(hours) * 3600) + 
        (parseInt(minutes) * 60)
      );
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeToEndSeconds = BigInt(currentTimestamp + totalSeconds);

      await writeContractAsync({
        address: betAddress,
        abi: betABI,
        functionName: "hostBet",
        args: [
          amountInUSDC,
          timeToEndSeconds,
          hostTwitter,
          token,
          email,
          usdcContractAddress,
        ],
      });
    } catch (error) {
      console.error("Error creating bet:", error);
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="border-2 border-black bg-white">
          Create New Bet
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Bet</SheetTitle>
          <SheetDescription>
            Enter the details for your new bet
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex justify-end w-full">
          <Button
            variant="ghost"
            onClick={handleMintAndApprove}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Mint & Approve"}
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Bet Amount (USDT)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Time Until End</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="days" className="text-sm text-gray-500">Days</Label>
                <Input
                  id="days"
                  type="number"
                  min="0"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="hours" className="text-sm text-gray-500">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="minutes" className="text-sm text-gray-500">Minutes</Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostTwitter">Twitter Handle</Label>
            <Input
              id="hostTwitter"
              value={hostTwitter}
              onChange={(e) => setHostTwitter(e.target.value)}
              placeholder="@username"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="encryptedKey">Enter Private Key</Label>
            <Input
              id="encryptedKey"
              value={encryptedKey}
              onChange={(e) => setEncryptedKey(e.target.value)}
              placeholder="Enter Private Key"
              required
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full border-2 border-black"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Bet"}
          </Button>
          {isSuccess && (
            <div className="text-green-600 text-sm mt-2">
              Bet created successfully!
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateBetSheet;