import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const receivables = Array.isArray(body) ? body : body.receivables;

    if (!Array.isArray(receivables)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of receivables." }, { status: 400 });
    }

    let upsertedCount = 0;
    let deletedCount = 0;

    for (const rec of receivables) {
      if (rec.isDeleted) {
        await prisma.receivable.deleteMany({
          where: { localId: rec.id },
        });
        deletedCount++;
        continue;
      }

      await prisma.receivable.upsert({
        where: { localId: rec.id },
        update: {
          customerName: rec.customerName,
          totalDebt: rec.totalDebt,
          status: rec.status,
          syncedAt: new Date(),
        },
        create: {
          localId: rec.id,
          customerName: rec.customerName,
          totalDebt: rec.totalDebt,
          status: rec.status,
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} receivables and deleted ${deletedCount}`
    });

  } catch (error) {
    console.error("Sync Receivables Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
