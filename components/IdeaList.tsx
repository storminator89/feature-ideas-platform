import React, { useState } from 'react';
import { Session } from 'next-auth';
import { HandThumbUpIcon, ClockIcon, UserIcon, ChatBubbleLeftEllipsisIcon, ShareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import CommentSection from './CommentSection';

interface Idea {
  id: number;
  title: string;
  description: string;
  author: {
    id: number | string;
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
  }[];
  createdAt: string;
  _count?: {
    comments?: number;
  };
  status: 'pending' | 'approved' | 'rejected';
}

interface IdeaListProps {
  ideas: Idea[];
  onVote: (ideaId: number) => Promise<void>;
  onDelete: (ideaId: number) => Promise<void>;
  session: Session | null;
  onUpdateStatus: (ideaId: number, newStatus: 'pending' | 'approved' | 'rejected') => Promise<void>;
}

const IdeaList: React.FC<IdeaListProps> = ({ ideas, onVote, onDelete, session, onUpdateStatus }) => {
  const [expandedIdeas, setExpandedIdeas] = useState<number[]>([]);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [commentCounts, setCommentCounts] = useState<{[key: number]: number}>({});
  const [formattedDates, setFormattedDates] = useState<{[key: number]: string}>({});

  React.useEffect(() => {
    const newFormattedDates = ideas.reduce((acc, idea) => {
      acc[idea.id] = formatDate(idea.createdAt);
      return acc;
    }, {} as {[key: number]: string});
    setFormattedDates(newFormattedDates);
  }, [ideas]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const toggleExpand = (ideaId: number) => {
    setExpandedIdeas(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const toggleComments = (ideaId: number) => {
    setShowComments(prev => prev === ideaId ? null : ideaId);
  };

  const shareIdea = (idea: Idea) => {
    if (navigator.share) {
      navigator.share({
        title: idea.title,
        text: idea.description,
        url: window.location.href,
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      const shareText = `Check out this idea: ${idea.title}\n\n${idea.description}\n\n${window.location.href}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Idea link copied to clipboard!');
      }).catch(console.error);
    }
  };

  const handleCommentCountChange = (ideaId: number, count: number) => {
    setCommentCounts(prev => ({...prev, [ideaId]: count}));
  };

  const getStatusColor = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ideas.map((idea) => (
        <div key={idea.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {idea.category.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="text-gray-500 text-xs flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span suppressHydrationWarning>{formattedDates[idea.id] || formatDate(idea.createdAt)}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                  {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
            <p className={`text-sm text-gray-600 mb-4 ${expandedIdeas.includes(idea.id) ? '' : 'line-clamp-3'}`}>
              {idea.description}
            </p>
            {idea.description.length > 150 && (
              <button 
                onClick={() => toggleExpand(idea.id)} 
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200 text-sm flex items-center"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                {expandedIdeas.includes(idea.id) ? 'Show less' : 'Read more'}
              </button>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-1" />
                <span>{idea.author.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mr-1" />
                  {commentCounts[idea.id] ?? idea._count?.comments ?? 0}
                </span>
                <span className="flex items-center">
                  <HandThumbUpIcon className="h-4 w-4 mr-1" />
                  {idea.votes?.length || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            {session && (
              <button
                onClick={() => onVote(idea.id)}
                className={`p-2 rounded-full transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  idea.votes?.some((vote) => vote.userId === parseInt(session.user.id as string))
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <HandThumbUpIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => toggleComments(idea.id)}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => shareIdea(idea)}
              className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            {session && session.user && idea.author && idea.author.id && session.user.id === idea.author.id.toString() && (
              <button
                onClick={() => onDelete(idea.id)}
                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {showComments === idea.id && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <CommentSection 
                ideaId={idea.id} 
                onCommentCountChange={(count) => handleCommentCountChange(idea.id, count)}
              />
            </div>
          )}
          {session && session.user.role === 'ADMIN' && (
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Update Status:</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdateStatus(idea.id, 'pending')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => onUpdateStatus(idea.id, 'approved')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'approved' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => onUpdateStatus(idea.id, 'rejected')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default IdeaList;