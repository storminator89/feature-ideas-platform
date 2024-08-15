import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  if (req.method === 'POST') {
    try {
      const { content, ideaId } = req.body

      if (!content || !ideaId) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          user: { connect: { id: Number(session.user.id) } },
          idea: { connect: { id: Number(ideaId) } }
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      res.status(201).json(comment)
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({ message: 'Error creating comment', error })
    }
  } else if (req.method === 'GET') {
    try {
      const { ideaId } = req.query

      if (!ideaId) {
        return res.status(400).json({ message: 'Missing ideaId' })
      }

      const comments = await prisma.comment.findMany({
        where: { ideaId: Number(ideaId) },
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      res.status(200).json(comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      res.status(500).json({ message: 'Error fetching comments', error })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}