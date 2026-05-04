import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 단일 사용자 정보 가져오기
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        reactions: {
          include: { content: true },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        comments: {
          include: { content: true },
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 비밀번호는 제외하고 반환
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("User Detail Fetch Error:", error);
    return NextResponse.json({ error: "서버 에러가 발생했습니다." }, { status: 500 });
  }
}

// 사용자 정보 수정 (Role 또는 LeaningProfile 조정)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const { role, leaningProfile, nickname } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        role,
        leaningProfile,
        nickname
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("User Update Error:", error);
    return NextResponse.json({ error: "사용자 정보 수정 중 에러가 발생했습니다." }, { status: 500 });
  }
}
