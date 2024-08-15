import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'You must be logged in to vote.' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { ideaId } = req.body

  if (!ideaId) {
    return res.status(400).json({ message: 'Missing ideaId' })
  }

  try {
    const userId = parseInt(session.user.id as string)
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_ideaId: {
          userId: userId,
          ideaId: parseInt(ideaId)
        }
      }
    })

    if (existingVote) {
      // If vote exists, remove it (toggle off)
      await prisma.vote.delete({
        where: { id: existingVote.id }
      })
      res.status(200).json({ message: 'Vote removed' })
    } else {
      // If vote doesn't exist, create it
      await prisma.vote.create({
        data: {
          user: { connect: { id: userId } },
          idea: { connect: { id: parseInt(ideaId) } }
        }
      })
      res.status(201).json({ message: 'Vote added' })
    }
  } catch (error) {
    console.error('Error processing vote:', error)
    res.status(500).json({ message: 'Error processing vote' })
  }
}