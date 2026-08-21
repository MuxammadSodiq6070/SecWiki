import { NextResponse } from 'next/server'
import prisma from '../../../../../lib/prisma'
import { commandIdFromParams } from '../../../../../lib/command-api'

async function getPowerState(commandId: number, userEmail: string) {
  const [count, active] = await Promise.all([
    prisma.commandPower.count({ where: { commandId } }),
    userEmail ? prisma.commandPower.findUnique({ where: { commandId_userEmail: { commandId, userEmail } } }) : null
  ])
  return { count, active: Boolean(active) }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const commandId = commandIdFromParams(params.id)
    if (!commandId) return NextResponse.json({ error: "Noto'g'ri command" }, { status: 400 })
    const userEmail = new URL(request.url).searchParams.get('userEmail')?.trim().toLowerCase() || ''
    return NextResponse.json(await getPowerState(commandId, userEmail))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Power holatini olishda xatolik' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const commandId = commandIdFromParams(params.id)
    const input = await request.json()
    const userEmail = String(input.userEmail || '').trim().toLowerCase()
    if (!commandId || !userEmail) return NextResponse.json({ error: 'Foydalanuvchi aniqlanmadi' }, { status: 400 })

    const existing = await prisma.commandPower.findUnique({ where: { commandId_userEmail: { commandId, userEmail } } })
    if (existing) {
      await prisma.commandPower.delete({ where: { id: existing.id } })
    } else {
      await prisma.commandPower.create({ data: { commandId, userEmail } })
    }

    return NextResponse.json(await getPowerState(commandId, userEmail))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Power saqlanmadi' }, { status: 500 })
  }
}
