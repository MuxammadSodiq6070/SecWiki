import prisma from './prisma'

export async function recordAuthEvent(data: {
  name: string
  email: string
  event: string
  request: Request
}) {
  try {
    await prisma.authEvent.create({
      data: {
        name: data.name,
        email: data.email,
        event: data.event,
        ipAddress: data.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
        userAgent: data.request.headers.get('user-agent') || null
      }
    })
  } catch (error) {
    // Authentication must remain available while a new deployment is syncing AuthEvent.
    console.error('Auth audit event could not be saved:', error)
  }
}
