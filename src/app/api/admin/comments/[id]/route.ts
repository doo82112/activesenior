import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 댓글 삭제 (Admin 전용)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.comment.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: "댓글이 삭제되었습니다." });
  } catch (error) {
    console.error("Comment Delete Error:", error);
    return NextResponse.json({ error: "댓글 삭제 중 에러가 발생했습니다." }, { status: 500 });
  }
}

// 댓글 수정 (Admin 전용)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const { id } = await params;
    const { text } = await req.json();

    const updatedComment = await prisma.comment.update({
      where: { id: Number(id) },
      data: { text }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Comment Update Error:", error);
    return NextResponse.json({ error: "댓글 수정 중 에러가 발생했습니다." }, { status: 500 });
  }
}
