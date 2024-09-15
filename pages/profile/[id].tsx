import { GetServerSideProps, NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import prisma from '../../lib/prisma'
import Navigation from '../../components/Navigation'
import { UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon, HandThumbUpIcon, ChatBubbleLeftIcon, CalendarIcon, ChartBarIcon, BriefcaseIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { formatDate } from '../../utils/dateFormatter'

interface ProfileProps {
  user: {
    id: number
    name: string | null
    email: string
    createdAt: string
    role: string
    ideas: {
      id: number
      title: string
      createdAt: string
      status: string | undefined
      _count: {
        votes: number
        comments: number
      }
    }[]
    _count?: {
      ideas?: number
      votes?: number
    }
  }
}

const Profile: NextPage<ProfileProps> = ({ user }) => {
  const { data: session } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('ideas')

  const isOwnProfile = session?.user?.id === user.id.toString()

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password: password || undefined }),
      })

      if (response.ok) {
        setIsEditing(false)
        router.reload()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert(error instanceof Error ? error.message : 'Failed to update profile. Please try again.')
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Unknown'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getTotalVotes = () => {
    return user.ideas.reduce((sum, idea) => sum + idea._count.votes, 0)
  }

  const getAverageVotes = () => {
    const totalVotes = getTotalVotes()
    return user.ideas.length > 0 ? (totalVotes / user.ideas.length).toFixed(2) : '0'
  }

  const getMostVotedIdea = () => {
    if (user.ideas.length === 0) return null
    return user.ideas.reduce((prev, current) => (prev._count.votes > current._count.votes) ? prev : current)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{user.name ? `${user.name}'s Profile` : 'User Profile'} | Feature Ideas Platform</title>
        <meta name="description" content={`Profile page of ${user.name || 'user'}`} />
      </Head>

      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="flex-shrink-0">
              <div className="relative">
                <UserCircleIcon className="h-16 w-16 text-gray-300" />
                <span className="absolute inset-0 shadow-inner rounded-full" aria-hidden="true"></span>
              </div>
            </div>
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-gray-900">{user.name || 'Anonymous User'}</h1>
              <p className="text-sm font-medium text-gray-500">Joined on {formatDate(user.createdAt)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
            {isOwnProfile && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <UserCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Full name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    user.name || 'Not set'
                  )}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {isEditing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    user.email
                  )}
                </dd>
              </div>
              {isEditing && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <LockClosedIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    New Password
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </dd>
                </div>
              )}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Role
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  Joined
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </div>
          {isEditing && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={handleUpdateProfile}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="sm:hidden">
            <label htmlFor="tabs" className="sr-only">Select a tab</label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              onChange={(e) => setActiveTab(e.target.value)}
              value={activeTab}
            >
              <option value="ideas">Ideas</option>
              <option value="stats">Statistics</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`${
                    activeTab === 'ideas'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Ideas
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`${
                    activeTab === 'stats'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Statistics
                </button>
              </nav>
            </div>
          </div>
        </div>

        {activeTab === 'ideas' && (
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User's Ideas</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {user.ideas.map((idea) => (
                  <li key={idea.id}>
                    <Link href={`/ideas/${idea.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">{idea.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(idea.status)}`}>
                              {formatStatus(idea.status)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <HandThumbUpIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {idea._count.votes} votes
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <ChatBubbleLeftIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                              {idea._count.comments} comments
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            <p>
                              Created on <time dateTime={idea.createdAt}>{formatDate(idea.createdAt)}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Statistics</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ChartBarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      Total Ideas
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{user._count?.ideas || 0}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <HandThumbUpIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      Total Votes Received
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{getTotalVotes()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ChartBarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      Average Votes per Idea
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{getAverageVotes()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <HandThumbUpIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      Most Voted Idea
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {getMostVotedIdea() ? (
                        <>
                          <p className="font-semibold">{getMostVotedIdea()?.title}</p>
                          <p>{getMostVotedIdea()?._count.votes} votes</p>
                        </>
                      ) : (
                        'No ideas yet'
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <ChartBarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      Ideas by Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex justify-between items-center">
                        <span>Pending</span>
                        <span>{user.ideas.filter(idea => idea.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span>Approved</span>
                        <span>{user.ideas.filter(idea => idea.status === 'approved').length}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span>Rejected</span>
                        <span>{user.ideas.filter(idea => idea.status === 'rejected').length}</span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userId = parseInt(context.params?.id as string, 10)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: true,
      ideas: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          status: true,
          _count: {
            select: {
              votes: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          ideas: true,
          votes: true,
        },
      },
    },
  })

  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: JSON.parse(JSON.stringify({
        ...user,
        createdAt: user.createdAt.toISOString(),
        ideas: user.ideas.map((idea) => ({
          ...idea,
          createdAt: idea.createdAt.toISOString(),
        })),
      })),
    },
  }
}

export default Profile

