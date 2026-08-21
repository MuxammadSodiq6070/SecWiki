import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { isAdminRequest } from '../../../../lib/admin-auth'

export async function GET() {
  if (!isAdminRequest()) return NextResponse.json({ error: 'Admin ruxsati kerak' }, { status: 401 })

  let events = []
  try {
    events = await prisma.authEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 500 })
  } catch (error) {
    console.error('Audit table is not ready:', error)
  }
  const users = Array.from(new Map(events.filter((event) => event.event === 'USER_LOGIN').map((event) => [event.email, event])).values())
  return NextResponse.json({ users, events })
}
