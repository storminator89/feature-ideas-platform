import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  console.log("Server-side session:", session) // Debugging
  console.log("Received request body:", req.body);
  console.log("Session:", session);

  if (req.method === 'GET') {
    try {
      const ideas = await prisma.idea.findMany({
        include: {
          author: {
            select: { name: true }
          },
          category: {
            select: { name: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      res.status(200).json(ideas)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching ideas', error })
    }
  } else if (req.method === 'POST') {
    if (!session?.user?.id) {
      console.log("Unauthorized: No valid session found")
      return res.status(401).json({ message: 'Not authenticated' })
    }

    try {
      const { title, description, categoryId } = req.body

      if (!title || !description || !categoryId) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const authorId = session.user.id

      const newIdea = await prisma.idea.create({
        data: {
          title,
          description,
          author: { connect: { id: Number(authorId) } },
          category: { connect: { id: Number(categoryId) } }
        },
        include: {
          author: {
            select: { name: true }
          },
          category: {
            select: { name: true }
          },
          _count: {
            select: { comments: true }
          }
        }
      })
      res.status(201).json(newIdea)
    } catch (error) {
      console.error('Error creating idea:', error)
      res.status(500).json({ message: 'Error creating idea', error })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}