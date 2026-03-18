import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We execute deleting all transactional content in a Prisma transaction
    await prisma.$transaction([
      prisma.transaction.deleteMany({}),
      prisma.expense.deleteMany({}),
      prisma.receivableLog.deleteMany({}),
      prisma.receivable.deleteMany({}),
      prisma.adjustment.deleteMany({}),
      
      // Zero out all wallet balances
      prisma.wallet.updateMany({
        data: {
          balance: 0
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      message: "Database reset successfully on server." 
    });

  } catch (error) {
    console.error("Database Reset Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
