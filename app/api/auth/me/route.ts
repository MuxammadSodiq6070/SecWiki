import { NextResponse } from 'next/server'
import { adminUsername, isAdminRequest } from '../../../../lib/admin-auth'

export function GET() {
  return NextResponse.json({ isAdmin: isAdminRequest(), username: isAdminRequest() ? adminUsername() : null })
}
