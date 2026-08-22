import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { serializeCommand } from '../../../lib/command-api'
import { isAdminRequest } from '../../../lib/admin-auth'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userEmail = url.searchParams.get('userEmail')?.trim().toLowerCase() || ''
    const commands = await prisma.command.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { powers: true, comments: true } } }
    })
    const powered = userEmail
      ? await prisma.commandPower.findMany({ where: { userEmail }, select: { commandId: true } })
      : []
    const poweredCommandIds = new Set<number>(powered.map((item) => item.commandId))
    const output = commands.map((command) => serializeCommand(command, poweredCommandIds))

    if (url.searchParams.has('export')) {
      if (!isAdminRequest()) return NextResponse.json({ error: 'Admin ruxsati kerak' }, { status: 401 })
      return new NextResponse(JSON.stringify(output, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="hoogle-commands-export.json"'
        }
      })
    }

    return NextResponse.json(output)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Ro'yxat olishda xatolik" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdminRequest()) return NextResponse.json({ error: 'Faqat admin yangi maʼlumot qoʼsha oladi' }, { status: 401 })
    const body = await request.json()
    const payload = Array.isArray(body)
      ? body
      : Array.isArray(body?.Command)
        ? body.Command
        : body?.import && Array.isArray(body.data)
          ? body.data
          : null

    if (payload) {
      const created = await prisma.command.createMany({
        data: payload.map((item: Record<string, unknown>) => ({
          title: typeof item.title === 'string' && item.title ? item.title : 'No title',
          category: typeof item.category === 'string' && item.category ? item.category : 'Umumiy',
          commandText: typeof item.commandText === 'string' ? item.commandText : '',
          shortDesc: typeof item.shortDesc === 'string' ? item.shortDesc : null,
          fullDoc: typeof item.fullDoc === 'string' ? item.fullDoc : null,
          parameters: normalizeParameters(item.parameters)
        })),
        skipDuplicates: true
      })
      return NextResponse.json({ imported: created.count })
    }

    if (!body || typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'Sarlavha kiritilishi shart' }, { status: 400 })
    }

    const created = await prisma.command.create({
      data: {
        title: body.title.trim(),
        category: body.category || 'Umumiy',
        commandText: body.commandText || '',
        shortDesc: body.shortDesc || null,
        fullDoc: body.fullDoc || null,
        parameters: JSON.stringify(body.parameters || [])
      }
    })

    return NextResponse.json(serializeCommand(created), { status: 201 })
  } catch (error) {
    console.error(error)
    const message = error instanceof Error ? error.message : 'Nomaʼlum xatolik'
    const databaseMessage = message.includes("Can't reach database server")
      ? "Vercel DATABASE_URL Supabase pooler emas. DATABASE_URL uchun :6543 transaction pooler, DIRECT_URL uchun :5432 ishlating."
      : message.includes('user not found in the database')
        ? "DATABASE_URL ichidagi database user Supabase'da mavjud emas. Pooler uchun postgres.PROJECT_REF userini yoki Supabase'da yaratilgan custom userni ishlating."
      : message
    return NextResponse.json({ error: `Saqlashda xatolik: ${databaseMessage}` }, { status: 500 })
  }
}

function normalizeParameters(value: unknown) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return JSON.stringify(Array.isArray(parsed) ? parsed : [])
    } catch {
      return '[]'
    }
  }
  return JSON.stringify(Array.isArray(value) ? value : [])
}
