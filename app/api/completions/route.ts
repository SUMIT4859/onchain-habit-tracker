import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { base, baseSepolia } from "viem/chains";
import { CONTRACT_ADDRESSES, HABIT_TRACKER_ABI } from "@/utils/contract";

export async function GET(request: Request) {
  try {
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

    if (!address.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      );
    }

    const chainIdNum = Number(chainId);
    if (isNaN(chainIdNum)) {
      return NextResponse.json(
        { error: "Invalid chainId" },
        { status: 400 }
      );
    }

    const contractAddress = CONTRACT_ADDRESSES[chainIdNum];
    if (!contractAddress) {
      return NextResponse.json(
        { error: "Unsupported chainId" },
        { status: 400 }
      );
    }

    let habitIdBigInt: bigint;
    try {
      habitIdBigInt = BigInt(habitId);
    } catch {
      return NextResponse.json(
        { error: "Invalid habitId" },
        { status: 400 }
      );
    }

    const chain = chainIdNum === 8453 ? base : baseSepolia;

    const client = createPublicClient({
      chain,
      transport: http(),
    });

    const completions = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: HABIT_TRACKER_ABI,
      functionName: "getCompletions",
      args: [address as `0x${string}`, habitIdBigInt],
    });

    return NextResponse.json({
      completions: (completions as bigint[]).map((c) => c.toString()),
    });

  } catch (error) {
    console.error("Error fetching completions:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}