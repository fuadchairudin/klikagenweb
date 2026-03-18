import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const wallets = body.wallets;

    if (!Array.isArray(wallets)) {
      return NextResponse.json({ error: "Invalid payload format. Expected an array of 'wallets'." }, { status: 400 });
    }

    let upsertedCount = 0;

    for (const data of wallets) {
      await prisma.wallet.upsert({
        where: { localId: data.id }, 
        update: {
          type: data.type,
          name: data.name,
          balance: data.balance,
          syncedAt: new Date(),
        },
        create: {
          localId: data.id,
          type: data.type,
          name: data.name,
          balance: data.balance,
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} wallets` 
    });

  } catch (error) {
    console.error("Sync Wallets Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
