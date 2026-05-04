import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        leaningProfile: true,
        createdAt: true,
        _count: {
          select: {
            reactions: true,
            comments: true,
          }
        }
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("User Fetch Error:", error);
    return NextResponse.json({ error: "서버 에러가 발생했습니다." }, { status: 500 });
  }
}
