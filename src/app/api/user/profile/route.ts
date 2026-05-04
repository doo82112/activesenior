import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 내 정보 가져오기
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    // 북마크(Activity) 수 추가로 가져오기
    const bookmarkCount = await prisma.activity.count({
      where: { userId, isBookmarked: true }
    });

    return NextResponse.json({ ...user, bookmarkCount });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ error: "정보를 불러오는 중 에러가 발생했습니다." }, { status: 500 });
  }
}

// 내 정보 수정 (닉네임, 비밀번호)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    const { nickname, currentPassword, newPassword } = await req.json();

    const updateData: any = {};
    if (nickname) updateData.nickname = nickname;

    // 비밀번호 변경 로직
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "현재 비밀번호를 입력해야 합니다." }, { status: 400 });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "현재 비밀번호가 일치하지 않습니다." }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return NextResponse.json({ message: "정보가 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "정보 수정 중 에러가 발생했습니다." }, { status: 500 });
  }
}
