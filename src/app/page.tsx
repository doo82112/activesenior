import { prisma } from "@/lib/prisma";
import { InfiniteSlider } from "@/components/main/InfiniteSlider";
import { UserMenu } from "@/components/main/UserMenu";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await getServerSession(authOptions);
  const { id: targetId } = await searchParams;

  // 1. 최신 컨텐츠 50개 가져오기 (추천 후보군)
  const candidateContent = await prisma.content.findMany({
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

  // 기본적으로 최신 50개를 무작위로 섞음 (비로그인 상태이거나 성향 데이터가 같을 때 다채로운 피드 제공)
  let sortedContent = [...candidateContent].sort(() => Math.random() - 0.5);

  // 2. 로그인한 사용자일 경우, 성향 기반 추천 정렬
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

        // 성향 일치도가 동일한 경우 (거리 차이가 거의 없음), 기존의 랜덤 순서를 유지
        if (Math.abs(distA - distB) < 0.001) {
          return 0; 
        }

        return distA - distB;
      });
    }
  }

  // 3. 특정 ID가 지정된 경우 해당 컨텐츠를 맨 앞으로
  if (targetId) {
    const targetContent = await prisma.content.findUnique({
      where: { id: Number(targetId) },
      include: {
        _count: { 
          select: { 
            reactions: true,
            comments: true
          } 
        }
      }
    });

    if (targetContent) {
      // 중복 제거 후 맨 앞에 추가
      sortedContent = [
        targetContent,
        ...sortedContent.filter(c => c.id !== targetContent.id)
      ];
    }
  }

  // 상위 10개만 슬라이더에 제공
  const topContent = sortedContent.slice(0, 10);

  const formattedContent = topContent.map(item => ({
    ...item,
    reactionCount: item._count?.reactions || 0,
    commentCount: item._count?.comments || 0
  }));

  return (
    <main className="h-screen w-full bg-background overflow-hidden relative">
      <InfiniteSlider key={targetId || 'default'} initialContent={formattedContent as any} />
    </main>
  );
}
