import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import prisma from '../../lib/prisma'
import Navigation from '../../components/Navigation'
import { formatDate } from '../../utils/dateFormatter'
import { useState, useEffect } from 'react'
import { HandThumbUpIcon, ChatBubbleLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface IdeaProps {
  idea: {
    id: number
    title: string
    description: string
    createdAt: string
    updatedAt: string
    author: {
      id: number
      name: string
    }
    category: {
      id: number
      name: string
    }
    votes: {
      id: number
      userId: number
    }[]
    comments: {
      id: number
      content: string
      createdAt: string
      user: {
        id: number
        name: string
      }
    }[]
    _count: {
      votes: number
      comments: number
    }
    status: string
  }
}

const IdeaPage: NextPage<IdeaProps> = ({ idea }) => {
  const { data: session } = useSession()
  const [voteCount, setVoteCount] = useState(idea._count.votes)
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    if (session && session.user) {
      setHasVoted(idea.votes.some((vote) => vote.userId === parseInt(session.user.id as string)))
    }
  }, [session, idea.votes])

  const handleVote = async () => {
    if (!session) {
      alert('You must be signed in to vote')
      return
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id })
      })

      if (response.ok) {
        setVoteCount(hasVoted ? voteCount - 1 : voteCount + 1)
        setHasVoted(!hasVoted)
      } else {
        throw new Error('Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{idea.title} | Feature Ideas Platform</title>
        <meta name="description" content={idea.description} />
      </Head>

      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">{idea.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Proposed by {idea.author.name} on {formatDate(idea.createdAt)}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: idea.description }} />
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleVote}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-md ${
                    hasVoted
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  } hover:bg-blue-200 transition duration-150 ease-in-out`}
                >
                  <HandThumbUpIcon className="h-5 w-5" />
                  <span>{voteCount} Votes</span>
                </button>
                <div className="flex items-center space-x-2 text-gray-500">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span>{idea._count.comments} Comments</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  idea.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                  {idea.category.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>
          <ul className="space-y-4">
            {idea.comments.map((comment) => (
              <li key={comment.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{comment.user.name}</h3>
                      <p className="text-sm text-gray-500">{formatDate(comment.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-700">{comment.content}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const ideaId = parseInt(context.params?.id as string, 10)

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    include: {
      author: {
        select: { id: true, name: true }
      },
      category: true,
      votes: true,
      comments: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { votes: true, comments: true }
      }
    }
  })

  if (!idea) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      idea: JSON.parse(JSON.stringify({
        ...idea,
        createdAt: idea.createdAt.toISOString(),
        updatedAt: idea.updatedAt.toISOString(),
        comments: idea.comments.map(comment => ({
          ...comment,
          createdAt: comment.createdAt.toISOString()
        }))
      }))
    }
  }
}

export default IdeaPage
