import React, { useState, useMemo } from 'react'
import { PencilSquareIcon, TrashIcon, ChatBubbleLeftEllipsisIcon, CheckIcon, XMarkIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

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

interface IdeaManagerProps {
  ideas: Idea[];
  onDeleteIdea: (id: number) => Promise<void>;
  onDeleteComment: (ideaId: number, commentId: number) => Promise<void>;
  onUpdateIdeaStatus: (id: number, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
}

const IdeaManager: React.FC<IdeaManagerProps> = ({
  ideas,
  onDeleteIdea,
  onDeleteComment,
  onUpdateIdeaStatus
}) => {
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => 
      (idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       idea.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || idea.status === statusFilter)
    );
  }, [ideas, searchTerm, statusFilter]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ideas</h2>
        
        <div className="mb-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
              className="appearance-none w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <FunnelIcon className="h-5 w-5 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {filteredIdeas.length === 0 ? (
          <p className="text-center text-gray-500 mt-6">No ideas found matching your criteria.</p>
        ) : (
          <ul className="space-y-6">
            {filteredIdeas.map((idea) => (
              <li key={idea.id} className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition duration-300 ease-in-out">{idea.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by <span className="font-medium">{idea.author.name}</span> in <span className="font-medium text-indigo-600">{idea.category.name}</span> • {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
                        {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                      </span>
                      <button
                        onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 focus:outline-none transition duration-300 ease-in-out"
                      >
                        <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteIdea(idea.id)}
                        className="p-2 text-red-600 hover:text-red-800 focus:outline-none transition duration-300 ease-in-out"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600">{idea.description}</p>
                  {expandedIdea === idea.id && (
                    <div className="mt-6">
                      <div className="flex space-x-3 mb-4">
                        <button
                          onClick={() => onUpdateIdeaStatus(idea.id, 'approved')}
                          className={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out ${
                            idea.status === 'approved' 
                              ? 'bg-green-600 text-white focus:ring-green-500' 
                              : 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500'
                          }`}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onUpdateIdeaStatus(idea.id, 'rejected')}
                          className={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out ${
                            idea.status === 'rejected' 
                              ? 'bg-red-600 text-white focus:ring-red-500' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500'
                          }`}
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onUpdateIdeaStatus(idea.id, 'pending')}
                          className={`px-4 py-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ease-in-out ${
                            idea.status === 'pending' 
                              ? 'bg-yellow-600 text-white focus:ring-yellow-500' 
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500'
                          }`}
                        >
                          Pending
                        </button>
                      </div>
                      <h4 className="font-semibold text-lg mb-3">Comments ({idea.comments.length})</h4>
                      {idea.comments.length > 0 ? (
                        <ul className="space-y-3">
                          {idea.comments.map((comment) => (
                            <li key={comment.id} className="bg-white p-4 rounded-md shadow-sm">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-600">{comment.content}</p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    by <span className="font-medium">{comment.user.name}</span> • {new Date(comment.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onDeleteComment(idea.id, comment.id)}
                                  className="p-1 text-red-600 hover:text-red-800 focus:outline-none transition duration-300 ease-in-out"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No comments yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default IdeaManager