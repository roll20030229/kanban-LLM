import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/user'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || '参数验证失败'
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { name, email, password } = validation.data

    await connectDB()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册失败:', error)
    return NextResponse.json({ error: '注册失败' }, { status: 500 })
  }
}
