import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { CONTRACT_ADDRESSES, HABIT_TRACKER_ABI } from "@/utils/config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const habitId = searchParams.get("habitId");
  const chainId = searchParams.get("chainId");

  if (!address || habitId === null || !chainId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const chainIdNum = parseInt(chainId);
  const contractAddress = CONTRACT_ADDRESSES[chainIdNum];

  if (!contractAddress) {
    return NextResponse.json({ error: "Invalid chain ID" }, { status: 400 });
  }

  try {
    const chain = chainIdNum === 8453 ? base : baseSepolia;

    const client = createPublicClient({
      chain,
      transport: http(),
    });

    const completions = await client.readContract({
      address: contractAddress,
      abi: HABIT_TRACKER_ABI,
      functionName: "getCompletions",
      args: [address as `0x${string}`, BigInt(habitId)],
    });

    return NextResponse.json({
      completions: (completions as bigint[]).map((c) => c.toString()),
    });
  } catch (error) {
    console.error("Error fetching completions:", error);
    return NextResponse.json(
      { error: "Failed to fetch completions" },
      { status: 500 }
    );
  }
}
