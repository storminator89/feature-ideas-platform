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

      if (idea.authorId !== Number(session.user.id)) {
        return res.status(403).json({ message: 'Not authorized to delete this idea' })
      }

      // Zuerst alle zugehörigen Votes löschen
      await prisma.vote.deleteMany({
        where: { ideaId: Number(id) }
      })

      // Dann die Idee löschen
      await prisma.idea.delete({
        where: { id: Number(id) }
      })

      res.status(200).json({ message: 'Idea and associated votes deleted successfully' })
    } catch (error) {
      console.error('Error deleting idea:', error)
      res.status(500).json({ message: 'Error deleting idea', error })
    }
  } else {
    res.setHeader('Allow', ['DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}