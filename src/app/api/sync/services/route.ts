import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/auth";

export async function POST(req: Request) {
  if (!verifyApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const services = Array.isArray(body) ? body : body.services;

    if (!Array.isArray(services)) {
      return NextResponse.json({ error: "Invalid payload format. Expected an array of 'services'." }, { status: 400 });
    }

    let upsertedCount = 0;

    for (const data of services) {
      await prisma.service.upsert({
        where: { localId: data.id }, 
        update: {
          name: data.name,
          adminBank: data.adminBank,
          syncedAt: new Date(),
        },
        create: {
          localId: data.id,
          name: data.name,
          adminBank: data.adminBank,
          syncedAt: new Date(),
        },
      });
      upsertedCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${upsertedCount} services` 
    });

  } catch (error) {
    console.error("Sync Services Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
