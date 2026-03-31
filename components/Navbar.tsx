"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { motion } from "framer-motion";
import { getNetworkName, getNetworkColor } from "@/utils/helpers";
import { Activity, Zap } from "lucide-react";

export function Navbar() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full glass"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 neu-shadow-sm">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Habit Tracker
          </span>
        </motion.div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white ${getNetworkColor(chainId)}`}
            >
              <Zap className="h-3 w-3" />
              {getNetworkName(chainId)}
            </motion.div>
          )}

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <motion.button
                          onClick={openConnectModal}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground neu-shadow-sm transition-all hover:bg-primary/90"
                        >
                          Connect Wallet
                        </motion.button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <motion.button
                          onClick={openChainModal}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
                        >
                          Wrong Network
                        </motion.button>
                      );
                    }

                    return (
                      <motion.button
                        onClick={openAccountModal}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 rounded-lg glass-light px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary/50"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {account.displayName}
                      </motion.button>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </motion.header>
  );
}
