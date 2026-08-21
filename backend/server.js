require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

app.use(cors({ origin: frontendUrl.split(',').map((value) => value.trim()), credentials: false }))
app.use(express.json({ limit: '1mb' }))

function parseCommand(command, poweredCommandIds = new Set()) {
  let parameters = []
  try {
    if (command.parameters) parameters = JSON.parse(command.parameters)
  } catch (_) {
    parameters = []
  }

  return {
    ...command,
    parameters,
    powerCount: command._count?.powers || 0,
    commentCount: command._count?.comments || 0,
    powered: poweredCommandIds.has(command.id)
  }
}

async function listCommands(userEmail = '') {
  const commands = await prisma.command.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { powers: true, comments: true } } }
  })
  const powered = userEmail
    ? await prisma.commandPower.findMany({ where: { userEmail }, select: { commandId: true } })
    : []
  const poweredCommandIds = new Set(powered.map((item) => item.commandId))
  return commands.map((command) => parseCommand(command, poweredCommandIds))
}

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'hoogle-api' })
})

app.get('/api/commands', async (request, response, next) => {
  try {
    const commands = await listCommands(String(request.query.userEmail || '').trim().toLowerCase())
    if (request.query.export) {
      response.attachment('hoogle-commands-export.json').type('application/json').send(JSON.stringify(commands, null, 2))
      return
    }
    response.json(commands)
  } catch (error) {
    next(error)
  }
})

app.post('/api/commands', async (request, response, next) => {
  try {
    const body = request.body
    const payload = Array.isArray(body) ? body : body.import && Array.isArray(body.data) ? body.data : null
    if (payload) {
      const created = await prisma.command.createMany({
        data: payload.map((item) => ({
          title: item.title || 'No title',
          category: item.category || 'Umumiy',
          commandText: item.commandText || '',
          shortDesc: item.shortDesc || null,
          fullDoc: item.fullDoc || null,
          parameters: JSON.stringify(item.parameters || [])
        })),
        skipDuplicates: true
      })
      response.json({ imported: created.count })
      return
    }

    if (!body.title || typeof body.title !== 'string') {
      response.status(400).json({ error: 'Sarlavha kiritilishi shart' })
      return
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
    response.status(201).json(parseCommand(created))
  } catch (error) {
    next(error)
  }
})

app.get('/api/commands/:id', async (request, response, next) => {
  try {
    const id = Number(request.params.id)
    const command = await prisma.command.findUnique({ where: { id } })
    if (!command) {
      response.status(404).json({ error: 'Topilmadi' })
      return
    }
    response.json(parseCommand(command))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/commands/:id', async (request, response, next) => {
  try {
    await prisma.command.delete({ where: { id: Number(request.params.id) } })
    response.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

app.get('/api/commands/:id/comments', async (request, response, next) => {
  try {
    const comments = await prisma.commandComment.findMany({
      where: { commandId: Number(request.params.id) },
      orderBy: { createdAt: 'asc' }
    })
    response.json(comments)
  } catch (error) {
    next(error)
  }
})

app.post('/api/commands/:id/comments', async (request, response, next) => {
  try {
    const body = String(request.body.body || '').trim()
    const authorName = String(request.body.authorName || '').trim()
    const authorEmail = String(request.body.authorEmail || '').trim().toLowerCase()
    if (!body || !authorName || !authorEmail) {
      response.status(400).json({ error: "Comment va foydalanuvchi ma'lumoti shart" })
      return
    }
    const comment = await prisma.commandComment.create({
      data: {
        commandId: Number(request.params.id),
        body: body.slice(0, 1000),
        authorName: authorName.slice(0, 80),
        authorEmail
      }
    })
    response.status(201).json(comment)
  } catch (error) {
    next(error)
  }
})

app.get('/api/commands/:id/power', async (request, response, next) => {
  try {
    const commandId = Number(request.params.id)
    const userEmail = String(request.query.userEmail || '').trim().toLowerCase()
    const [count, active] = await Promise.all([
      prisma.commandPower.count({ where: { commandId } }),
      userEmail ? prisma.commandPower.findUnique({ where: { commandId_userEmail: { commandId, userEmail } } }) : null
    ])
    response.json({ count, active: Boolean(active) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/commands/:id/power', async (request, response, next) => {
  try {
    const commandId = Number(request.params.id)
    const userEmail = String(request.body.userEmail || '').trim().toLowerCase()
    if (!userEmail) {
      response.status(400).json({ error: 'Foydalanuvchi aniqlanmadi' })
      return
    }
    const existing = await prisma.commandPower.findUnique({ where: { commandId_userEmail: { commandId, userEmail } } })
    if (existing) {
      await prisma.commandPower.delete({ where: { id: existing.id } })
    } else {
      await prisma.commandPower.create({ data: { commandId, userEmail } })
    }
    const [count, active] = await Promise.all([
      prisma.commandPower.count({ where: { commandId } }),
      prisma.commandPower.findUnique({ where: { commandId_userEmail: { commandId, userEmail } } })
    ])
    response.json({ count, active: Boolean(active) })
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Server xatosi' })
})

const server = app.listen(port, () => {
  console.log(`Hoogle API listening on port ${port}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
