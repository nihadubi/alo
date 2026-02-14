import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const express = (await import('express')).default
const cors = (await import('cors')).default
const { PrismaClient } = await import('@prisma/client')
const { ClerkExpressRequireAuth, clerkClient } = await import('@clerk/clerk-sdk-node')

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

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
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || null
    const imageUrl = user.imageUrl || null

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { email, name, imageUrl },
      create: { userId, email, name, imageUrl },
    })

    res.json({ profile })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'PROFILE_SYNC_FAILED' })
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

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
