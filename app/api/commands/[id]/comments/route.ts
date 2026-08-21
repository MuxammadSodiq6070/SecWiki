import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { commandIdFromParams } from '../../../../../lib/command-api'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const commandId = commandIdFromParams(params.id)
    if (!commandId) return NextResponse.json({ error: "Noto'g'ri command" }, { status: 400 })
    const comments = await prisma.commandComment.findMany({ where: { commandId }, orderBy: { createdAt: 'asc' } })
    return NextResponse.json(comments)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Commentlarni olishda xatolik' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const commandId = commandIdFromParams(params.id)
    const input = await request.json()
    const body = String(input.body || '').trim()
    const authorName = String(input.authorName || '').trim()
    const authorEmail = String(input.authorEmail || '').trim().toLowerCase()

    if (!commandId || !body || !authorName || !authorEmail) {
      return NextResponse.json({ error: "Comment va foydalanuvchi ma'lumoti shart" }, { status: 400 })
    }

    const comment = await prisma.commandComment.create({
      data: { commandId, body: body.slice(0, 1000), authorName: authorName.slice(0, 80), authorEmail }
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Comment saqlanmadi' }, { status: 500 })
  }
}
