import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 댓글 목록 가져오기
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json({ error: "contentId가 필요합니다." }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { contentId: Number(contentId) },
      include: {
        user: {
          select: {
            nickname: true,
            leaningProfile: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "댓글을 불러오는 중 에러가 발생했습니다." }, { status: 500 });
  }
}

// 댓글 작성
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { contentId, text } = await req.json();
    const userId = Number((session.user as any).id);

    const comment = await prisma.comment.create({
      data: {
        text,
        contentId: Number(contentId),
        userId,
      },
      include: {
        user: {
          select: {
            nickname: true,
            leaningProfile: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    return NextResponse.json({ error: "댓글 작성 중 에러가 발생했습니다." }, { status: 500 });
  }
}
