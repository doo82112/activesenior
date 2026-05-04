import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursorStr = searchParams.get("cursor");

    if (!cursorStr) {
      return NextResponse.json({ error: "Cursor is required" }, { status: 400 });
    }

    const cursorDate = new Date(cursorStr);

    // 1. 커서 이전의 50개 컨텐츠 가져오기
    const candidateContent = await prisma.content.findMany({
      where: {
        createdAt: {
          lt: cursorDate
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: {
          select: { 
            reactions: true,
            comments: true
          }
        }
      }
    });

    if (candidateContent.length === 0) {
      return NextResponse.json([]);
    }

    // 기본적으로 무작위로 섞음
    let sortedContent = [...candidateContent].sort(() => Math.random() - 0.5);

    // 2. 로그인한 사용자일 경우, 성향 기반 추천 정렬
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: Number(session.user.id) }
      });

      if (user && user.leaningProfile) {
        const uProfile = user.leaningProfile as any;
        
        sortedContent.sort((a, b) => {
          const aTag = (a.leaningTag as any) || { red: 33.3, blue: 33.3, orange: 33.4 };
          const bTag = (b.leaningTag as any) || { red: 33.3, blue: 33.3, orange: 33.4 };

          const distA = Math.sqrt(
            Math.pow(uProfile.red - aTag.red, 2) +
            Math.pow(uProfile.blue - aTag.blue, 2) +
            Math.pow(uProfile.orange - aTag.orange, 2)
          );

          const distB = Math.sqrt(
            Math.pow(uProfile.red - bTag.red, 2) +
            Math.pow(uProfile.blue - bTag.blue, 2) +
            Math.pow(uProfile.orange - bTag.orange, 2)
          );

          // 성향 일치도가 동일한 경우 무작위 순서 유지
          if (Math.abs(distA - distB) < 0.001) {
            return 0; 
          }

          return distA - distB;
        });
      }
    }

    return NextResponse.json(sortedContent);

  } catch (error) {
    console.error("Feed Fetch Error:", error);
    return NextResponse.json({ error: "피드를 불러오는 중 에러가 발생했습니다." }, { status: 500 });
  }
}
