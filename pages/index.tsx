import { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useSession, getSession } from 'next-auth/react'
import prisma from '../lib/prisma'
import { Category } from '@prisma/client'
import IdeaList from '../components/IdeaList'
import IdeaSubmissionForm from '../components/IdeaSubmissionForm'
import { FunnelIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import Navigation from '../components/Navigation'
import KanbanBoard from '../components/KanbanBoard'

interface Idea {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
  };
  votes: {
    id: number;
    userId: number;
    createdAt: string;
  }[];
  _count: {
    comments: number;
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface HomeProps {
  initialIdeas: Idea[];
  categories: Category[];
}

const Home: NextPage<HomeProps> = ({ initialIdeas, categories }) => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const { data: session, status } = useSession()
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'mostVotes'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>(initialIdeas);
  const [activeTab, setActiveTab] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    const filtered = ideas
      .filter(idea =>
        (selectedCategory === null || idea.category.id === selectedCategory) &&
        (idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          idea.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return (b.votes?.length || 0) - (a.votes?.length || 0);
        }
      });
    setFilteredIdeas(filtered);
  }, [ideas, selectedCategory, sortBy, searchTerm]);

  const handleSubmitIdea = async (newIdea: { title: string; description: string; categoryId: number }) => {
    if (!session) {
      alert('You must be signed in to submit an idea.')
      return
    }

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(newIdea),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit idea')
      }
      const createdIdea = await response.json()
      setIdeas((prevIdeas) => [createdIdea, ...prevIdeas])
      setShowSubmissionForm(false)
    } catch (error) {
      console.error('Error submitting idea:', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('Failed to submit idea. Please try again.')
      }
    }
  }

  const handleVote = async (ideaId: number) => {
    if (!session) {
      alert('You must be logged in to vote')
      return
    }
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId })
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId
            ? {
              ...idea,
              votes: idea.votes.some(vote => vote.userId === parseInt(session.user.id as string))
                ? idea.votes.filter(vote => vote.userId !== parseInt(session.user.id as string))
                : [...idea.votes, {
                  id: Date.now(),
                  userId: parseInt(session.user.id as string),
                  ideaId,
                  createdAt: new Date().toISOString()
                }]
            }
            : idea
        )
      )
    } catch (error) {
      console.error('Error voting:', error)
      alert('Failed to vote. Please try again.')
    }
  }

  const handleDeleteIdea = async (ideaId: number) => {
    if (!session) {
      alert('You must be logged in to delete an idea.')
      return
    }

    if (confirm('Are you sure you want to delete this idea?')) {
      try {
        const response = await fetch(`/api/ideas/${ideaId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Failed to delete idea')
        }

        setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId))
      } catch (error) {
        console.error('Error deleting idea:', error)
        alert('Failed to delete idea. Please try again.')
      }
    }
  }

  const handleUpdateIdeaStatus = async (ideaId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update idea status')
      }

      const updatedIdea = await response.json()
      setIdeas(prevIdeas => prevIdeas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea))
    } catch (error) {
      console.error('Error updating idea status:', error)
      alert('Failed to update idea status. Please try again.')
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Feature Ideas Platform</title>
        <meta name="description" content="Submit and vote on feature ideas" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <div className="bg-white shadow-md rounded-lg overflow-hidden sticky top-6">
              <div className="px-6 py-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FunnelIcon className="h-6 w-6 mr-2 text-indigo-500" />
                  Filter Ideas
                </h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        id="search"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Search ideas"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedCategory === null ? '' : selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                    <select
                      id="sortBy"
                      name="sortBy"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'newest' | 'mostVotes')}
                    >
                      <option value="newest">Newest</option>
                      <option value="mostVotes">Most Votes</option>
                    </select>
                  </div>
                </div>
                {session && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowSubmissionForm(true)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Submit New Idea
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-3/4">
            {showSubmissionForm && (
              <div className="mb-6">
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="px-6 py-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit a New Idea</h2>
                    <IdeaSubmissionForm
                      categories={categories}
                      onSubmit={handleSubmitIdea}
                      onCancel={() => setShowSubmissionForm(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Current Ideas</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('list')}
                      className={`px-4 py-2 rounded-md ${
                        activeTab === 'list'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      List View
                    </button>
                    <button
                      onClick={() => setActiveTab('kanban')}
                      className={`px-4 py-2 rounded-md ${
                        activeTab === 'kanban'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Kanban View
                    </button>
                  </div>
                </div>
                {activeTab === 'list' ? (
                  <IdeaList
                    ideas={filteredIdeas}
                    onVote={handleVote}
                    onDelete={handleDeleteIdea}
                    session={session}
                    onUpdateStatus={handleUpdateIdeaStatus}
                  />
                ) : (
                  <div className="h-[calc(100vh-200px)]">
                    <KanbanBoard
                      ideas={filteredIdeas}
                      onVote={handleVote}
                      onDelete={handleDeleteIdea}
                      onUpdateStatus={handleUpdateIdeaStatus}
                      session={session}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  const [ideas, categories] = await Promise.all([
    prisma.idea.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        votes: true,
        _count: {
          select: { comments: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany(),
  ])

  const safeIdeas = ideas.map(idea => ({
    ...idea,
    author: {
      ...idea.author,
      name: idea.author.name || 'Anonymous'
    },
    createdAt: idea.createdAt.toISOString(),
    updatedAt: idea.updatedAt.toISOString(),
    votes: idea.votes.map(vote => ({
      ...vote,
      createdAt: vote.createdAt.toISOString()
    }))
  }))

  return {
    props: {
      session: session ? JSON.parse(JSON.stringify(session)) : null,
      initialIdeas: JSON.parse(JSON.stringify(safeIdeas)),
      categories: JSON.parse(JSON.stringify(categories)),
    },
  }
}

export default Home