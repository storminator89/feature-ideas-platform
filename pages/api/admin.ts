import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'GET') {
    const { type } = req.query

    switch (type) {
      case 'categories':
        const categories = await prisma.category.findMany()
        return res.status(200).json(categories)
      case 'users':
        const users = await prisma.user.findMany({
          select: { id: true, name: true, email: true, role: true }
        })
        return res.status(200).json(users)
      case 'ideas':
        const ideas = await prisma.idea.findMany({
          include: {
            author: { select: { name: true } },
            category: { select: { name: true } },
            comments: {
              include: {
                user: { select: { name: true } }
              }
            },
            _count: { select: { votes: true, comments: true } }
          }
        })
        return res.status(200).json(ideas)
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }
  } else if (req.method === 'POST') {
    const { type, data } = req.body

    switch (type) {
      case 'category':
        try {
          const newCategory = await prisma.category.create({ data })
          return res.status(201).json(newCategory)
        } catch (error) {
          console.error('Error creating category:', error)
          return res.status(500).json({ message: 'Error creating category', error })
        }
      case 'user':
        try {
          const { email, name, password, role } = data
          const hashedPassword = await hash(password, 10)
          const newUser = await prisma.user.create({
            data: {
              email,
              name,
              password: hashedPassword,
              role: role || 'USER'
            }
          })
          const { password: _, ...userWithoutPassword } = newUser
          return res.status(201).json(userWithoutPassword)
        } catch (error) {
          console.error('Error creating user:', error)
          return res.status(500).json({ message: 'Error creating user', error })
        }
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }
  } else if (req.method === 'PUT') {
    const { type, id, data } = req.body

    switch (type) {
      case 'category':
        try {
          const updatedCategory = await prisma.category.update({
            where: { id: Number(id) },
            data
          })
          return res.status(200).json(updatedCategory)
        } catch (error) {
          console.error('Error updating category:', error)
          return res.status(500).json({ message: 'Error updating category', error })
        }
      case 'user':
        try {
          const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data
          })
          return res.status(200).json(updatedUser)
        } catch (error) {
          console.error('Error updating user:', error)
          return res.status(500).json({ message: 'Error updating user', error })
        }
      case 'idea':
        try {
          const updatedIdea = await prisma.idea.update({
            where: { id: Number(id) },
            data: {
              ...(data.status && { status: data.status }),
              ...(data.title && { title: data.title }),
              ...(data.description && { description: data.description }),
              // Add any other fields that can be updated
            },
            include: {
              author: { select: { name: true } },
              category: { select: { name: true } },
              comments: {
                include: {
                  user: { select: { name: true } }
                }
              },
              _count: { select: { votes: true, comments: true } }
            }
          })
          return res.status(200).json(updatedIdea)
        } catch (error) {
          console.error('Error updating idea:', error)
          return res.status(500).json({ message: 'Error updating idea', error })
        }
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }
  } else if (req.method === 'DELETE') {
    const { type, id } = req.body

    switch (type) {
      case 'category':
        try {
          await prisma.category.delete({ where: { id: Number(id) } })
          return res.status(200).json({ message: 'Category deleted' })
        } catch (error) {
          console.error('Error deleting category:', error)
          return res.status(500).json({ message: 'Error deleting category', error })
        }
      case 'user':
        try {
          await prisma.user.delete({ where: { id: Number(id) } })
          return res.status(200).json({ message: 'User deleted' })
        } catch (error) {
          console.error('Error deleting user:', error)
          return res.status(500).json({ message: 'Error deleting user', error })
        }
      case 'idea':
        try {
          const deletedIdea = await prisma.$transaction(async (prisma) => {
            // Delete all associated votes
            await prisma.vote.deleteMany({
              where: { ideaId: Number(id) },
            })

            // Delete all associated comments
            await prisma.comment.deleteMany({
              where: { ideaId: Number(id) },
            })

            // Delete the idea itself
            const deletedIdea = await prisma.idea.delete({
              where: { id: Number(id) },
            })

            return deletedIdea
          })

          return res.status(200).json({ message: 'Idea and associated data deleted', deletedIdea })
        } catch (error) {
          console.error('Error deleting idea:', error)
          return res.status(500).json({ message: 'Error deleting idea', error })
        }
      case 'comment':
        try {
          const { commentId } = req.body
          await prisma.comment.delete({ 
            where: { 
              id: Number(commentId)
            } 
          })
          return res.status(200).json({ message: 'Comment deleted' })
        } catch (error) {
          console.error('Error deleting comment:', error)
          return res.status(500).json({ message: 'Error deleting comment', error })
        }
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}