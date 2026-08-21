import { PrismaClient } from '@prisma/client'

declare global {
  // allow global var in dev to persist PrismaClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var prisma: any
}

const prisma = global.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
