import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { contentId, type } = await req.json(); // type: 'like' | 'dislike'
    const userId = (session.user as any).id ? Number((session.user as any).id) : null;
    
    if (!userId) {
      return NextResponse.json({ error: "사용자 ID를 찾을 수 없습니다." }, { status: 400 });
    }

    // 1. 컨텐츠 정보 가져오기
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: "컨텐츠를 찾을 수 없습니다." }, { status: 404 });
    }

    // 2. 반응 저장 (이미 있으면 업데이트, 없으면 생성)
    await prisma.reaction.upsert({
      where: {
        userId_contentId: { userId, contentId },
      },
      update: { type },
      create: { userId, contentId, type },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      // --- (1) 사용자 성향 업데이트 로직 ---
      const currentUserProfile = (user.leaningProfile as any) || { red: 33.3, blue: 33.3, orange: 33.4 };
      const currentContentTag = (content.leaningTag as any) || { red: 0, blue: 0, orange: 0 };
      
      let newUserProfile = { ...currentUserProfile };
      const userLearningRate = 0.1; // 사용자 변화율 (10%)

      if (type === "like" && (currentContentTag.red + currentContentTag.blue + currentContentTag.orange > 0)) {
        // 좋아요: 컨텐츠의 현재 커뮤니티 성향 쪽으로 이동
        newUserProfile.red = currentUserProfile.red * (1 - userLearningRate) + currentContentTag.red * userLearningRate;
        newUserProfile.blue = currentUserProfile.blue * (1 - userLearningRate) + currentContentTag.blue * userLearningRate;
        newUserProfile.orange = currentUserProfile.orange * (1 - userLearningRate) + currentContentTag.orange * userLearningRate;
      }

      // 사용자 성향 정규화 (합계 100)
      const userTotal = newUserProfile.red + newUserProfile.blue + newUserProfile.orange;
      newUserProfile.red = (newUserProfile.red / userTotal) * 100;
      newUserProfile.blue = (newUserProfile.blue / userTotal) * 100;
      newUserProfile.orange = (newUserProfile.orange / userTotal) * 100;

      await prisma.user.update({
        where: { id: userId },
        data: { leaningProfile: newUserProfile },
      });

      // --- (2) 컨텐츠 성향 업데이트 로직 (집단지성) ---
      let newContentTag = { ...currentContentTag };
      const contentLearningRate = 0.2; // 컨텐츠 성향 변화 속도 (20%)

      if (type === "like") {
        if (currentContentTag.red === 0 && currentContentTag.blue === 0 && currentContentTag.orange === 0) {
          // 첫 투표면 사용자의 성향을 그대로 반영
          newContentTag = { ...currentUserProfile };
        } else {
          // 기존 투표가 있으면 사용자의 성향 쪽으로 이동
          newContentTag.red = currentContentTag.red * (1 - contentLearningRate) + currentUserProfile.red * contentLearningRate;
          newContentTag.blue = currentContentTag.blue * (1 - contentLearningRate) + currentUserProfile.blue * contentLearningRate;
          newContentTag.orange = currentContentTag.orange * (1 - contentLearningRate) + currentUserProfile.orange * contentLearningRate;
        }
      }

      // 컨텐츠 성향 정규화
      const contentTotal = newContentTag.red + newContentTag.blue + newContentTag.orange;
      if (contentTotal > 0) {
        newContentTag.red = (newContentTag.red / contentTotal) * 100;
        newContentTag.blue = (newContentTag.blue / contentTotal) * 100;
        newContentTag.orange = (newContentTag.orange / contentTotal) * 100;
      }

      await prisma.content.update({
        where: { id: contentId },
        data: { leaningTag: newContentTag },
      });

      console.log("Updated User Leaning:", newUserProfile);
      console.log("Updated Content Leaning:", newContentTag);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reaction Error:", error);
    return NextResponse.json({ error: "처리 중 에러가 발생했습니다." }, { status: 500 });
  }
}
