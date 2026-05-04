import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, nickname } = await req.json()

    if (!email || !password || !nickname) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        leaningProfile: { red: 33.3, blue: 33.3, orange: 33.4 } // Initial neutral profile (1-100 scale)
      }
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
