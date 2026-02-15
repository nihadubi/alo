import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const express = (await import('express')).default
const cors = (await import('cors')).default
const { createServer } = await import('node:http')
const { Server } = await import('socket.io')
const { AccessToken } = await import('livekit-server-sdk')
const { PrismaClient } = await import('@prisma/client')
const { ClerkExpressRequireAuth, clerkClient } = await import('@clerk/clerk-sdk-node')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
  },
})

const roomName = 'general'
const socketRoomPrefix = 'room:'

const getOrCreateCommunityRoom = async (communityId) => {
  const room = await prisma.room.findFirst({
    where: { communityId, name: roomName },
    select: { id: true, name: true, communityId: true },
  })

  if (room) {
    return room
  }

  return prisma.room.create({
    data: {
      name: roomName,
      communityId,
    },
    select: { id: true, name: true, communityId: true },
  })
}

io.on('connection', (socket) => {
  socket.on('room:join', ({ communityId } = {}) => {
    if (!communityId) {
      return
    }
    const targetRoom = `${socketRoomPrefix}${communityId}`
    const currentRoom = socket.data.currentRoom
    if (currentRoom && currentRoom !== targetRoom) {
      socket.leave(currentRoom)
    }
    socket.join(targetRoom)
    socket.data.currentRoom = targetRoom
  })
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.get('/api/communities', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) {
      res.json([])
      return
    }

    const communities = await prisma.community.findMany({
      where: { ownerId: profile.id },
      select: { id: true, name: true },
      orderBy: { createdAt: 'desc' },
    })

    res.json(communities)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'COMMUNITIES_FETCH_FAILED' })
  }
})

app.post('/api/communities', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) {
      res.status(404).json({ error: 'PROFILE_NOT_FOUND' })
      return
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name) {
      res.status(400).json({ error: 'NAME_REQUIRED' })
      return
    }

    const community = await prisma.community.create({
      data: {
        name,
        ownerId: profile.id,
      },
      select: { id: true, name: true },
    })

    res.status(201).json(community)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'COMMUNITY_CREATE_FAILED' })
  }
})

app.post('/api/profile/sync', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const user = await clerkClient.users.getUser(userId)
    const email = user.emailAddresses?.[0]?.emailAddress ?? null
    const defaultName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || null
    const imageUrl = user.imageUrl || null

    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, name: true },
    })

    let profile = null

    if (existingProfile) {
      const updateData = { email, imageUrl }
      if (!existingProfile.name && defaultName) {
        updateData.name = defaultName
      }
      profile = await prisma.profile.update({
        where: { userId },
        data: updateData,
      })
    } else {
      profile = await prisma.profile.create({
        data: { userId, email, name: defaultName, imageUrl },
      })
    }

    res.json({ profile })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'PROFILE_SYNC_FAILED' })
  }
})

app.post('/api/profile/update', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name || name.length < 2 || name.length > 32) {
      res.status(400).json({ error: 'NAME_INVALID' })
      return
    }

    const user = await clerkClient.users.getUser(userId)
    const email = user.emailAddresses?.[0]?.emailAddress ?? null
    const imageUrl = user.imageUrl || null

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { name, email, imageUrl },
      create: { userId, email, name, imageUrl },
    })

    res.json({ profile })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'PROFILE_UPDATE_FAILED' })
  }
})

app.post('/api/livekit/token', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const roomName = typeof req.body?.roomName === 'string' ? req.body.roomName.trim() : ''
    if (!roomName) {
      res.status(400).json({ error: 'ROOM_NAME_REQUIRED' })
      return
    }

    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL
    if (!livekitUrl) {
      res.status(500).json({ error: 'LIVEKIT_URL_MISSING' })
      return
    }

    const user = await clerkClient.users.getUser(userId)
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || userId

    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: userId,
      name,
    })

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    res.json({ token: token.toJwt(), url: livekitUrl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'LIVEKIT_TOKEN_FAILED' })
  }
})

app.get('/api/messages', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const communityId = typeof req.query?.communityId === 'string' ? req.query.communityId : ''
    if (!communityId) {
      res.status(400).json({ error: 'COMMUNITY_ID_REQUIRED' })
      return
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    })

    if (!community) {
      res.status(404).json({ error: 'COMMUNITY_NOT_FOUND' })
      return
    }

    const room = await getOrCreateCommunityRoom(community.id)
    const messages = await prisma.message.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      select: {
        id: true,
        content: true,
        createdAt: true,
        profileId: true,
        roomId: true,
        profile: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    res.json(messages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'MESSAGES_FETCH_FAILED' })
  }
})

app.post('/api/messages', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId
    const requestedUserId = typeof req.body?.userId === 'string' ? req.body.userId : ''
    if (requestedUserId && requestedUserId !== userId) {
      res.status(403).json({ error: 'USER_MISMATCH' })
      return
    }

    const communityId = typeof req.body?.communityId === 'string' ? req.body.communityId : ''
    if (!communityId) {
      res.status(400).json({ error: 'COMMUNITY_ID_REQUIRED' })
      return
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { id: true },
    })

    if (!community) {
      res.status(404).json({ error: 'COMMUNITY_NOT_FOUND' })
      return
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) {
      res.status(404).json({ error: 'PROFILE_NOT_FOUND' })
      return
    }

    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : ''
    if (!content) {
      res.status(400).json({ error: 'CONTENT_REQUIRED' })
      return
    }

    const room = await getOrCreateCommunityRoom(community.id)
    const message = await prisma.message.create({
      data: {
        content,
        roomId: room.id,
        profileId: profile.id,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        profileId: true,
        roomId: true,
        profile: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    io.to(`${socketRoomPrefix}${community.id}`).emit('message:new', message)
    res.status(201).json(message)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'MESSAGE_CREATE_FAILED' })
  }
})

app.use((error, req, res, next) => {
  void next
  const code = error?.errors?.[0]?.code
  const status = error?.status
  const message = String(error?.message || '').toLowerCase()
  if (code === 'unauthenticated' || status === 401 || message.includes('unauthenticated')) {
    res.status(401).json({ error: 'UNAUTHENTICATED' })
    return
  }
  console.error(error)
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' })
})

const port = process.env.PORT ? Number(process.env.PORT) : 4000

httpServer.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
