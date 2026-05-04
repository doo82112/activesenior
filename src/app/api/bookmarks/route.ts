import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 북마크 토글 (저장/취소)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { contentId } = await req.json();
    const userId = Number((session.user as any).id);

    // 기존 활동 내역 확인
    const activity = await prisma.activity.findUnique({
      where: {
        userId_contentId: { userId, contentId }
      }
    });

    if (activity) {
      // 이미 존재하면 북마크 상태 토글
      const updated = await prisma.activity.update({
        where: { id: activity.id },
        data: { isBookmarked: !activity.isBookmarked }
      });
      return NextResponse.json({ isBookmarked: updated.isBookmarked });
    } else {
      // 없으면 새로 생성
      const created = await prisma.activity.create({
        data: {
          userId,
          contentId,
          isBookmarked: true
        }
      });
      return NextResponse.json({ isBookmarked: created.isBookmarked });
    }
  } catch (error) {
    console.error("Bookmark Error:", error);
    return NextResponse.json({ error: "북마크 처리 중 에러가 발생했습니다." }, { status: 500 });
  }
}

// 저장된 목록 가져오기
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = Number((session.user as any).id);

    const bookmarks = await prisma.activity.findMany({
      where: {
        userId,
        isBookmarked: true
      },
      include: {
        content: {
          include: {
            _count: {
              select: { reactions: true }
            }
          }
        }
      },
      orderBy: {
        lastViewedAt: "desc"
      }
    });

    return NextResponse.json(bookmarks.map(b => b.content));
  } catch (error) {
    console.error("Fetch Bookmarks Error:", error);
    return NextResponse.json({ error: "목록을 불러오는 중 에러가 발생했습니다." }, { status: 500 });
  }
}
