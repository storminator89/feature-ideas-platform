import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      const idea = await prisma.idea.findUnique({
        where: { id: Number(id) },
        select: { authorId: true }
      })

      if (!idea) {
        return res.status(404).json({ message: 'Idea not found' })
      }

      if (idea.authorId !== Number(session.user.id) && session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Not authorized to delete this idea' })
      }

      // Zuerst alle zugehörigen Votes löschen
      await prisma.vote.deleteMany({
        where: { ideaId: Number(id) }
      })

      // Dann alle zugehörigen Kommentare löschen
      await prisma.comment.deleteMany({
        where: { ideaId: Number(id) }
      })

      // Schließlich die Idee löschen
      await prisma.idea.delete({
        where: { id: Number(id) }
      })

      res.status(200).json({ message: 'Idea and associated votes and comments deleted successfully' })
    } catch (error) {
      console.error('Error deleting idea:', error)
      res.status(500).json({ message: 'Error deleting idea', error })
    }
  } else if (req.method === 'PATCH') {
    try {
      const { status } = req.body

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
      }

      const updatedIdea = await prisma.idea.update({
        where: { id: Number(id) },
        data: { status },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          category: {
            select: { id: true, name: true }
          },
          votes: true,
          _count: {
            select: { comments: true }
          }
        }
      })

      const safeIdea = {
        ...updatedIdea,
        createdAt: updatedIdea.createdAt.toISOString(),
        updatedAt: updatedIdea.updatedAt.toISOString(),
        votes: updatedIdea.votes.map(vote => ({
          ...vote,
          createdAt: vote.createdAt.toISOString()
        }))
      }

      res.status(200).json(safeIdea)
    } catch (error) {
      console.error('Error updating idea:', error)
      res.status(500).json({ message: 'Error updating idea', error })
    }
  } else {
    res.setHeader('Allow', ['DELETE', 'PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}