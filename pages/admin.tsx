import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import CategoryManager from '../components/admin/CategoryManager'
import UserManager from '../components/admin/UserManager'
import IdeaManager from '../components/admin/IdeaManager'
import Dashboard from '../components/admin/Dashboard'
import AdminTabs from '../components/admin/AdminTabs'

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
  };
}

interface Idea {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  categoryId: number;
  author: {
    name: string | null;
  };
  category: {
    name: string;
  };
  comments: Comment[];
  status: 'pending' | 'approved' | 'rejected';
}

interface DashboardData {
  totalIdeas: number;
  totalUsers: number;
  totalComments: number;
  totalVotes: number;
  ideaStatusCounts: {
    [status: string]: number;
  };
  topCategories: Array<{ name: string; count: number }>;
  recentTrends: {
    newIdeasLastWeek: number;
    newUsersLastWeek: number;
    newCommentsLastWeek: number;
    newVotesLastWeek: number;
  };
  weeklyData: Array<{
    week: string;
    ideas: number;
    users: number;
    comments: number;
    votes: number;
  }>;
  topUsersByIdeas: Array<{ id: number; name: string; ideaCount: number }>;
  topIdeasByVotes: Array<{ id: number; title: string; voteCount: number }>;
  userEngagement: {
    averageIdeasPerUser: number;
    averageCommentsPerUser: number;
    averageVotesPerUser: number;
  };
  ideaSuccessRate: number;
}

interface AdminPageProps {
  initialCategories: Category[]
  initialUsers: User[]
  initialIdeas: Idea[]
}

const AdminPage: React.FC<AdminPageProps> = ({ initialCategories, initialUsers, initialIdeas }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'categories' | 'users' | 'ideas'>('dashboard')
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [isLoading, setIsLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin?type=dashboard')
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === 'dashboard') {
      fetchDashboardData()
    }
  }, [activeTab])

  const handleAddCategory = async (name: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'category', data: { name } }),
      })
      if (response.ok) {
        const newCategory = await response.json()
        setCategories([...categories, newCategory])
      }
    } catch (error) {
      console.error('Error adding category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCategory = async (id: number, name: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'category', id, data: { name } }),
      })
      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c))
      }
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'category', id }),
        })
        if (response.ok) {
          setCategories(categories.filter(c => c.id !== id))
        }
      } catch (error) {
        console.error('Error deleting category:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'user', data: userData }),
      })
      if (response.ok) {
        const newUser = await response.json()
        setUsers([...users, newUser])
      }
    } catch (error) {
      console.error('Error adding user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async (id: number, userData: Partial<User>) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'user', id, data: userData }),
      })
      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'user', id }),
        })
        if (response.ok) {
          setUsers(users.filter(u => u.id !== id))
        }
      } catch (error) {
        console.error('Error deleting user:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteIdea = async (id: number) => {
    if (confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'idea', id }),
        })
        if (response.ok) {
          setIdeas(ideas.filter(i => i.id !== id))
        }
      } catch (error) {
        console.error('Error deleting idea:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteComment = async (ideaId: number, commentId: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'comment', ideaId, commentId }),
        })
        if (response.ok) {
          setIdeas(ideas.map(idea => 
            idea.id === ideaId 
              ? { ...idea, comments: idea.comments.filter(c => c.id !== commentId) }
              : idea
          ))
        }
      } catch (error) {
        console.error('Error deleting comment:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleUpdateIdeaStatus = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: 'idea', id, data: { status } }),
      })
      if (response.ok) {
        const updatedIdea = await response.json()
        setIdeas(ideas.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea))
      }
    } catch (error) {
      console.error('Error updating idea status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard</title>
      </Head>

      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && dashboardData && (
                  <Dashboard {...dashboardData} />
                )}
                {activeTab === 'categories' && (
                  <CategoryManager
                    categories={categories}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                )}
                {activeTab === 'users' && (
                  <UserManager
                    users={users}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                  />
                )}
                {activeTab === 'ideas' && (
                  <IdeaManager
                    ideas={ideas}
                    onDeleteIdea={handleDeleteIdea}
                    onDeleteComment={handleDeleteComment}
                    onUpdateIdeaStatus={handleUpdateIdeaStatus}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session || session.user?.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  const fetchData = async (type: string) => {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin?type=${type}`, {
      headers: {
        Cookie: context.req.headers.cookie || '',
      },
    })
    if (response.ok) {
      return response.json()
    }
    return []
  }

  const [categories, users, ideas] = await Promise.all([
    fetchData('categories'),
    fetchData('users'),
    fetchData('ideas'),
  ])

  return {
    props: {
      initialCategories: categories,
      initialUsers: users,
      initialIdeas: ideas,
    },
  }
}

export default AdminPage
