import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password harus diisi" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        username: username,
        password: password,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
    }

    // Hanya Admin yang boleh login ke web monitoring
    if (user.role !== "Admin") {
      return NextResponse.json({ error: "Hanya Admin yang dapat mengakses dashboard monitoring" }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
