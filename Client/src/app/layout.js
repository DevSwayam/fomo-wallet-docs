import "@coinbase/onchainkit/styles.css";
import { Montserrat } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import './favicon.ico';

import { getConfig } from "../onchainkit/wagmi";
import OnchainProviders from "@/onchainkit/provider";
import { Toaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  // Montserrat comes in multiple weights - you can specify which ones you want to load
  weight: ["300", "400", "500", "600", "700"],
  // You can also specify italic styles if needed
  // style: ['normal', 'italic'],
});

export const metadata = {
  title: "Fomo Wallet - Bet on the Future of CryptoCurrency",
  description: "Let the bet begin!",
  icons : {
    icon : "./favicon.ico",
  }
};

export default function RootLayout({ children }) {
  // const initialState = cookieToInitialState(
  //   getConfig(),
  //   headers().get("cookie")
  // );
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <OnchainProviders>
          {children}
          <Toaster />
        </OnchainProviders>
      </body>
    </html>
  );
}

