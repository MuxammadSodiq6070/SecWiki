import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { commandIdFromParams, serializeCommand } from '../../../../lib/command-api'
import { isAdminRequest } from '../../../../lib/admin-auth'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = commandIdFromParams(params.id)
    if (!id) return NextResponse.json({ error: "Noto'g'ri command" }, { status: 400 })

    const command = await prisma.command.findUnique({ where: { id } })
    if (!command) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 })
    return NextResponse.json(serializeCommand(command))
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Xatolik' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdminRequest()) return NextResponse.json({ error: 'Admin ruxsati kerak' }, { status: 401 })
    const id = commandIdFromParams(params.id)
    if (!id) return NextResponse.json({ error: "Noto'g'ri command" }, { status: 400 })
    await prisma.command.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 })
  }
}
