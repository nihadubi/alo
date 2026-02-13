import 'dotenv/config'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node'

const app = express()
const prisma = new PrismaClient()

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

const port = process.env.PORT ? Number(process.env.PORT) : 4000

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`)
})
