import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from "next-auth/react"
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

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
      case 'dashboard':
        try {
          const totalIdeas = await prisma.idea.count();
          const totalUsers = await prisma.user.count();
          const totalComments = await prisma.comment.count();
          const totalVotes = await prisma.vote.count();

          const ideaStatusCounts = await prisma.idea.groupBy({
            by: ['status'],
            _count: true,
          });

          const topCategories = await prisma.category.findMany({
            select: {
              name: true,
              _count: { select: { ideas: true } },
            },
            orderBy: {
              ideas: { _count: 'desc' },
            },
            take: 5,
          });

          const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));

          const recentTrends = {
            newIdeasLastWeek: await prisma.idea.count({
              where: { createdAt: { gte: oneWeekAgo } },
            }),
            newUsersLastWeek: await prisma.user.count({
              where: { createdAt: { gte: oneWeekAgo } },
            }),
            newCommentsLastWeek: await prisma.comment.count({
              where: { createdAt: { gte: oneWeekAgo } },
            }),
            newVotesLastWeek: await prisma.vote.count({
              where: { createdAt: { gte: oneWeekAgo } },
            }),
          };

          const weeklyData = await Promise.all(
            Array.from({ length: 4 }, (_, i) => {
              const start = new Date(new Date().setDate(new Date().getDate() - 7 * (i + 1)));
              const end = new Date(new Date().setDate(new Date().getDate() - 7 * i));
              return Promise.all([
                prisma.idea.count({ where: { createdAt: { gte: start, lt: end } } }),
                prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
                prisma.comment.count({ where: { createdAt: { gte: start, lt: end } } }),
                prisma.vote.count({ where: { createdAt: { gte: start, lt: end } } }),
              ]).then(([ideas, users, comments, votes]) => ({
                week: start.toISOString().slice(0, 10),
                ideas,
                users,
                comments,
                votes,
              }));
            })
          );

          const topUsersByIdeas = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              _count: { select: { ideas: true } },
            },
            orderBy: {
              ideas: { _count: 'desc' },
            },
            take: 5,
          });

          const topIdeasByVotes = await prisma.idea.findMany({
            select: {
              id: true,
              title: true,
              _count: { select: { votes: true } },
            },
            orderBy: {
              votes: { _count: 'desc' },
            },
            take: 5,
          });

          const userEngagement = {
            averageIdeasPerUser: totalIdeas / totalUsers,
            averageCommentsPerUser: totalComments / totalUsers,
            averageVotesPerUser: totalVotes / totalUsers,
          };

          const approvedIdeas = await prisma.idea.count({ where: { status: 'approved' } });
          const ideaSuccessRate = (approvedIdeas / totalIdeas) * 100;

          return res.status(200).json({
            totalIdeas,
            totalUsers,
            totalComments,
            totalVotes,
            ideaStatusCounts: Object.fromEntries(
              ideaStatusCounts.map(({ status, _count }) => [status, _count])
            ),
            topCategories: topCategories.map(cat => ({ name: cat.name, count: cat._count.ideas })),
            recentTrends,
            weeklyData,
            topUsersByIdeas: topUsersByIdeas.map(user => ({ id: user.id, name: user.name, ideaCount: user._count.ideas })),
            topIdeasByVotes: topIdeasByVotes.map(idea => ({ id: idea.id, title: idea.title, voteCount: idea._count.votes })),
            userEngagement,
            ideaSuccessRate,
          });
        } catch (error: unknown) {
          console.error('Error in dashboard data fetch:', error);
          return res.status(500).json({ message: 'Error fetching dashboard data', error: error instanceof Error ? error.message : 'Unknown error' });
        }
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
        } catch (error: unknown) {
          console.error('Error creating category:', error)
          return res.status(500).json({ message: 'Error creating category', error: error instanceof Error ? error.message : 'Unknown error' })
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
        } catch (error: unknown) {
          console.error('Error creating user:', error)
          return res.status(500).json({ message: 'Error creating user', error: error instanceof Error ? error.message : 'Unknown error' })
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
        } catch (error: unknown) {
          console.error('Error updating category:', error)
          return res.status(500).json({ message: 'Error updating category', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      case 'user':
        try {
          const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data
          })
          return res.status(200).json(updatedUser)
        } catch (error: unknown) {
          console.error('Error updating user:', error)
          return res.status(500).json({ message: 'Error updating user', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      case 'idea':
        try {
          const updatedIdea = await prisma.idea.update({
            where: { id: Number(id) },
            data: {
              ...(data.status && { status: data.status }),
              ...(data.title && { title: data.title }),
              ...(data.description && { description: data.description }),
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
        } catch (error: unknown) {
          console.error('Error updating idea:', error)
          return res.status(500).json({ message: 'Error updating idea', error: error instanceof Error ? error.message : 'Unknown error' })
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
        } catch (error: unknown) {
          console.error('Error deleting category:', error)
          return res.status(500).json({ message: 'Error deleting category', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      case 'user':
        try {
          await prisma.user.delete({ where: { id: Number(id) } })
          return res.status(200).json({ message: 'User deleted' })
        } catch (error: unknown) {
          console.error('Error deleting user:', error)
          return res.status(500).json({ message: 'Error deleting user', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      case 'idea':
        try {
          const deletedIdea = await prisma.$transaction(async (prisma) => {
            await prisma.vote.deleteMany({
              where: { ideaId: Number(id) },
            })
            await prisma.comment.deleteMany({
              where: { ideaId: Number(id) },
            })
            const deletedIdea = await prisma.idea.delete({
              where: { id: Number(id) },
            })
            return deletedIdea
          })
          return res.status(200).json({ message: 'Idea and associated data deleted', deletedIdea })
        } catch (error: unknown) {
          console.error('Error deleting idea:', error)
          return res.status(500).json({ message: 'Error deleting idea', error: error instanceof Error ? error.message : 'Unknown error' })
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
        } catch (error: unknown) {
          console.error('Error deleting comment:', error)
          return res.status(500).json({ message: 'Error deleting comment', error: error instanceof Error ? error.message : 'Unknown error' })
        }
      default:
        return res.status(400).json({ message: 'Invalid type' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
