import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from '../auth/[...nextauth]'
import prisma from '../../../lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const userId = parseInt(req.query.id as string, 10)

  if (session.user.id !== userId.toString()) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  if (req.method === 'PATCH') {
    try {
      const { name, email, password } = req.body

      const updateData: any = {}

      if (name !== undefined) {
        updateData.name = name
      }

      if (email !== undefined) {
        // Check if email is already in use
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: 'Email already in use' })
        }
        updateData.email = email
      }

      if (password !== undefined) {
        const hashedPassword = await bcrypt.hash(password, 10)
        updateData.password = hashedPassword
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      })

      res.status(200).json(updatedUser)
    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({ message: 'Failed to update user' })
    }
  } else {
    res.setHeader('Allow', ['PATCH'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
