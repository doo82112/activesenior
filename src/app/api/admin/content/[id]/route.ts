import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 단일 컨텐츠 가져오기
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id: Number(id) },
    });

    if (!content) {
      return NextResponse.json({ error: "컨텐츠를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Content Fetch Error:", error);
    return NextResponse.json({ error: "서버 에러가 발생했습니다." }, { status: 500 });
  }
}

// 컨텐츠 수정
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const { title, category, contentType, bodyContent, mediaUrl, audioUrl, leaningTag } = await req.json();

    const updatedContent = await prisma.content.update({
      where: { id: Number(id) },
      data: {
        title,
        category,
        contentType,
        bodyContent,
        mediaUrl,
        audioUrl,
        leaningTag,
      },

    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Content Update Error:", error);
    return NextResponse.json({ error: "컨텐츠 수정 중 에러가 발생했습니다." }, { status: 500 });
  }
}

// 컨텐츠 삭제
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.content.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "컨텐츠가 삭제되었습니다." });
  } catch (error) {
    console.error("Content Delete Error:", error);
    return NextResponse.json({ error: "컨텐츠 삭제 중 에러가 발생했습니다." }, { status: 500 });
  }
}
