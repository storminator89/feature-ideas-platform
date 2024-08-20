import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  const { id } = req.query
  const { content } = req.body

  if (req.method === 'POST') {
    try {
      const comment = await prisma.comment.create({
        data: {
          content,
          user: { connect: { id: Number(session.user.id) } },
          idea: { connect: { id: Number(id) } }
        },
        include: {
          user: {
            select: { name: true }
          }
        }
      })

      const safeComment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          name: comment.user.name
        }
      }

      res.status(201).json(safeComment)
    } catch (error) {
      console.error('Error creating comment:', error)
      res.status(500).json({ message: 'Error creating comment', error })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}