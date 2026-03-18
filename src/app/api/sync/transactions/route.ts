import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const transactions = Array.isArray(body) ? body : body.transactions;

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of transactions." }, { status: 400 });
    }

    let upsertedCount = 0;
    let deletedCount = 0;

    for (const trx of transactions) {
      // Handle soft deletes from Flutter
      if (trx.isDeleted) {
        await prisma.transaction.deleteMany({
          where: { localId: trx.id },
        });
        deletedCount++;
        continue;
      }

      await prisma.transaction.upsert({
        where: { localId: trx.id }, // Di SQLite namanya 'id', di Cloud namanya 'localId'
        update: {
          type: trx.type,
          amount: trx.amount,
          adminBank: trx.adminBank,
          adminUser: trx.adminUser,
          profit: trx.profit,
          isPiutang: trx.isPiutang,
          customerName: trx.customerName,
          walletId: trx.walletId,
          receivableId: trx.receivableId,
          serviceId: trx.serviceId,
          createdAt: new Date(trx.createdAt),
          syncedAt: new Date(),
        },
        create: {
          localId: trx.id,
          type: trx.type,
          amount: trx.amount,
          adminBank: trx.adminBank,
          adminUser: trx.adminUser,
          profit: trx.profit,
          isPiutang: trx.isPiutang,
          customerName: trx.customerName,
          walletId: trx.walletId,
          receivableId: trx.receivableId,
          serviceId: trx.serviceId,
          createdAt: new Date(trx.createdAt),
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} transactions and deleted ${deletedCount}` 
    });

  } catch (error) {
    console.error("Sync Transactions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
