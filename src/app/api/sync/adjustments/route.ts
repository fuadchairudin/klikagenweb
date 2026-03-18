import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const adjustments = Array.isArray(body) ? body : body.adjustments;

    if (!Array.isArray(adjustments)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of adjustments." }, { status: 400 });
    }

    let upsertedCount = 0;
    let deletedCount = 0;

    for (const adj of adjustments) {
      if (adj.isDeleted) {
        await prisma.adjustment.deleteMany({
          where: { localId: adj.id },
        });
        deletedCount++;
        continue;
      }

      await prisma.adjustment.upsert({
        where: { localId: adj.id },
        update: {
          type: adj.type,
          amount: adj.amount,
          fee: adj.fee,
          description: adj.description,
          walletId: adj.walletId,
          targetWalletId: adj.targetWalletId,
          createdAt: new Date(adj.createdAt),
          syncedAt: new Date(),
        },
        create: {
          localId: adj.id,
          type: adj.type,
          amount: adj.amount,
          fee: adj.fee,
          description: adj.description,
          walletId: adj.walletId,
          targetWalletId: adj.targetWalletId,
          createdAt: new Date(adj.createdAt),
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} adjustments and deleted ${deletedCount}`
    });

  } catch (error) {
    console.error("Sync Adjustments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
