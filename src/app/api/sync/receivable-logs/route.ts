import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const receivableLogs = Array.isArray(body) ? body : body.receivableLogs;

    if (!Array.isArray(receivableLogs)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of receivable logs." }, { status: 400 });
    }

    let upsertedCount = 0;
    let deletedCount = 0;

    for (const log of receivableLogs) {
      if (log.isDeleted) {
        await prisma.receivableLog.deleteMany({
          where: { localId: log.id },
        });
        deletedCount++;
        continue;
      }

      await prisma.receivableLog.upsert({
        where: { localId: log.id },
        update: {
          receivableId: log.receivableId,
          amountPaid: log.amountPaid,
          walletId: log.walletId,
          createdAt: new Date(log.createdAt),
          syncedAt: new Date(),
        },
        create: {
          localId: log.id,
          receivableId: log.receivableId,
          amountPaid: log.amountPaid,
          walletId: log.walletId,
          createdAt: new Date(log.createdAt),
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} receivable logs and deleted ${deletedCount}` 
    });

  } catch (error) {
    console.error("Sync Receivable Logs Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
