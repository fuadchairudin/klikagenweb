import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const expenses = Array.isArray(body) ? body : body.expenses;

    if (!Array.isArray(expenses)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of expenses." }, { status: 400 });
    }

    let upsertedCount = 0;
    let deletedCount = 0;

    for (const exp of expenses) {
      if (exp.isDeleted) {
        await prisma.expense.deleteMany({
          where: { localId: exp.id },
        });
        deletedCount++;
        continue;
      }

      await prisma.expense.upsert({
        where: { localId: exp.id },
        update: {
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
          walletId: exp.walletId,
          createdAt: new Date(exp.createdAt),
          syncedAt: new Date(),
        },
        create: {
          localId: exp.id,
          category: exp.category,
          amount: exp.amount,
          description: exp.description,
          walletId: exp.walletId,
          createdAt: new Date(exp.createdAt),
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} expenses and deleted ${deletedCount}` 
    });

  } catch (error) {
    console.error("Sync Expenses Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
