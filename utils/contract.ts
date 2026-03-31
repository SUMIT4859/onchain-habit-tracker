export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  84532: "0xd9145CCE52D386f254917e481eB44e9943F39138",
  8453: "0x083C4B91577a28cD96DC948952e12D6f5390E13C",
};

export const EXPLORER_URLS: Record<number, string> = {
  84532: "https://sepolia.basescan.org",
  8453: "https://basescan.org",
};

export const HABIT_TRACKER_ABI = [
  {
    name: "addHabit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "getHabits",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        type: "tuple[]",
        components: [
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "createdAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "markComplete",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "habitId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getCompletions",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "habitId", type: "uint256" },
    ],
    outputs: [{ type: "uint256[]" }],
  },
] as const;