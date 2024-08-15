import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { hash } from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { name, email, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Something went wrong' })
  }
}