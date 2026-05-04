import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }
    
    const { title, category, contentType, bodyContent, mediaUrl, audioUrl, leaningTag } = await req.json();

    if (!title || !category || !bodyContent) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
    }

    const content = await prisma.content.create({
      data: {
        title,
        category,
        contentType: contentType || "html",
        bodyContent,
        mediaUrl,
        audioUrl,
        leaningTag,
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error("Content Creation Error:", error);
    return NextResponse.json({ error: "컨텐츠 등록 중 서버 에러가 발생했습니다." }, { status: 500 });
  }
}
