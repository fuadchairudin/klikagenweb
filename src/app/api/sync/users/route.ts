import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const users = Array.isArray(body) ? body : body.users;

    if (!Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid payload format. Expected a JSON array of users." }, { status: 400 });
    }

    let upsertedCount = 0;
    const incomingIds: number[] = [];

    for (const user of users) {
      incomingIds.push(user.id);
      await prisma.user.upsert({
        where: { localId: user.id },
        update: {
          username: user.username,
          password: user.password,
          role: user.role,
          syncedAt: new Date(),
        },
        create: {
          localId: user.id,
          username: user.username,
          password: user.password,
          role: user.role,
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    // Delete users not in the payload
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        localId: {
          notIn: incomingIds
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} users. Deleted ${deletedUsers.count} users.` 
    });

  } catch (error) {
    console.error("Sync Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
