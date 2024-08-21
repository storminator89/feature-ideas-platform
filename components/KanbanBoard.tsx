import React, { useState, useCallback, useEffect } from 'react';
import { Session } from 'next-auth';
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, TrashIcon, UserIcon, ClockIcon, XMarkIcon, PaperAirplaneIcon, CheckIcon, ExclamationTriangleIcon, ShareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: number;
  content: string;
  author: {
    name: string;
  };
  createdAt: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  author: {
    name: string;
    email: string;
  };
  category: {
    name: string;
  };
  votes: any[] | undefined;
  comments: Comment[];
  _count: {
    comments: number;
  } | undefined;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface KanbanBoardProps {
  ideas: Idea[];
  onVote: (ideaId: number) => Promise<void>;
  onDelete: (ideaId: number) => Promise<void>;
  onUpdateStatus: (ideaId: number, newStatus: 'pending' | 'approved' | 'rejected') => Promise<void>;
  onAddComment: (ideaId: number, content: string) => Promise<void>;
  session: Session | null;
  viewMode: 'kanban' | 'list';
}

type ColumnType = 'pending' | 'approved' | 'rejected';

const ConfirmationModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-sm mx-auto"
      >
        <h3 className="text-lg font-medium text-gray-900 mb-4">Remove Vote</h3>
        <p className="text-sm text-gray-500 mb-4">
          You've already voted for this idea. Do you want to remove your vote?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Remove Vote
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Modal: React.FC<{ 
  idea: Idea; 
  onClose: () => void; 
  formatDate: (date: string) => string; 
  onVote: (ideaId: number) => Promise<void>; 
  onDelete: (ideaId: number) => Promise<void>;
  onAddComment: (ideaId: number, content: string) => Promise<void>;
  onUpdateStatus: (ideaId: number, newStatus: 'pending' | 'approved' | 'rejected') => Promise<void>;
  onShare: (idea: Idea) => void;
  isAdmin: boolean; 
  session: Session | null;
  hasVoted: boolean;
  showVoteConfirmation: (ideaId: number) => void;
}> = ({ 
  idea, 
  onClose, 
  formatDate, 
  onVote, 
  onDelete,
  onAddComment,
  onUpdateStatus,
  onShare,
  isAdmin, 
  session,
  hasVoted,
  showVoteConfirmation
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (newComment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddComment(idea.id, newComment);
        setNewComment('');
      } catch (error) {
        console.error('Failed to add comment:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleVote = () => {
    if (hasVoted) {
      showVoteConfirmation(idea.id);
    } else {
      onVote(idea.id);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusIcons = {
    pending: <ExclamationTriangleIcon className="h-5 w-5 mr-1" />,
    approved: <CheckIcon className="h-5 w-5 mr-1" />,
    rejected: <XMarkIcon className="h-5 w-5 mr-1" />,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
        <div className="mt-3">
          <div className="flex justify-between items-start">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{idea.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-2">
            <p className="text-md text-gray-600 whitespace-pre-wrap">{idea.description}</p>
            <div className="flex flex-wrap items-center mt-4 space-x-4">
              <span className="flex items-center text-sm text-gray-500">
                <UserIcon className="h-4 w-4 mr-1" />
                {idea.author.name}
              </span>
              <span className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(idea.createdAt)}
              </span>
              <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[idea.status]}`}>
                {statusIcons[idea.status]}
                {idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {idea.category.name}
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={handleVote}
                className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  hasVoted ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                <HandThumbUpIcon className="h-5 w-5 mr-1" />
                <span>{idea.votes?.length || 0} {hasVoted ? 'Voted' : 'Vote'}</span>
              </button>
              <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1" />
                <span>{idea._count?.comments || 0} Comments</span>
              </button>
              <button
                onClick={() => onShare(idea)}
                className="flex items-center text-green-600 hover:text-green-800 transition-colors duration-200"
              >
                <ShareIcon className="h-5 w-5 mr-1" />
                <span>Share</span>
              </button>
            </div>
            {(session?.user?.email === idea.author.email || isAdmin) && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this idea?')) {
                    onDelete(idea.id);
                    onClose();
                  }
                }}
                className="text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          {isAdmin && (
            <div className="mt-4">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Update Status</h4>
              <div className="flex space-x-2">
                {['pending', 'approved', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => onUpdateStatus(idea.id, status as 'pending' | 'approved' | 'rejected')}
                    className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      idea.status === status 
                        ? statusColors[status] 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {statusIcons[status as keyof typeof statusIcons]}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Comments</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {idea.comments && idea.comments.length > 0 ? (
                idea.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{comment.author.name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}
            </div>
            {session && (
              <div className="mt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isSubmitting || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                      Post Comment
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  ideas, 
  onVote, 
  onDelete, 
  onUpdateStatus, 
  onAddComment, 
  session,
  viewMode
}) => {
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [votedIdeas, setVotedIdeas] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<number | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType>('pending');

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    const storedVotedIdeas = localStorage.getItem('votedIdeas');
    if (storedVotedIdeas) {
      setVotedIdeas(JSON.parse(storedVotedIdeas));
    }
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idea: Idea) => {
    if (!isAdmin) return;
    setDraggedIdea(idea);
    e.dataTransfer.setData('text/plain', idea.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: ColumnType) => {
    if (!isAdmin) return;
    e.preventDefault();
    if (!draggedIdea) return;

    await onUpdateStatus(draggedIdea.id, newStatus);
    setDraggedIdea(null);
  };

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }, []);

  const columns: Record<ColumnType, Idea[]> = {
    pending: ideas.filter(idea => idea.status === 'pending'),
    approved: ideas.filter(idea => idea.status === 'approved'),
    rejected: ideas.filter(idea => idea.status === 'rejected'),
  };

  const getColumnStyle = (status: ColumnType) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'approved': return 'bg-green-50 border-green-200';
      case 'rejected': return 'bg-red-50 border-red-200';
    }
  };

  const handleShare = async (idea: Idea) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description,
          url: `${window.location.origin}/ideas/${idea.id}`,
        });
        console.log('Idea shared successfully');
      } catch (error) {
        console.error('Error sharing idea:', error);
      }
    } else {
      alert(`Share this idea:\n\nTitle: ${idea.title}\nDescription: ${idea.description}\nLink: ${window.location.origin}/ideas/${idea.id}`);
    }
  };

  const handleVote = async (ideaId: number) => {
    if (votedIdeas.includes(ideaId)) {
      setShowConfirmation(ideaId);
    } else {
      await onVote(ideaId);
      setVotedIdeas(prev => {
        const newVotedIdeas = [...prev, ideaId];
        localStorage.setItem('votedIdeas', JSON.stringify(newVotedIdeas));
        return newVotedIdeas;
      });
    }
  };

  const handleConfirmUnvote = async (ideaId: number) => {
    await onVote(ideaId);
    setVotedIdeas(prev => {
      const newVotedIdeas = prev.filter(id => id !== ideaId);
      localStorage.setItem('votedIdeas', JSON.stringify(newVotedIdeas));
      return newVotedIdeas;
    });
    setShowConfirmation(null);
  };

  const showVoteConfirmation = (ideaId: number) => {
    setShowConfirmation(ideaId);
  };

  const renderIdea = (idea: Idea) => {
    const hasVoted = votedIdeas.includes(idea.id);

    return (
      <div
        key={idea.id}
        onClick={() => setSelectedIdea(idea)}
        className={`bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 cursor-pointer relative`}
      >
        <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {idea.category.name}
        </span>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (hasVoted) {
              showVoteConfirmation(idea.id);
            } else {
              handleVote(idea.id);
            }
          }}
          className={`absolute top-2 right-2 flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
            hasVoted ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
          } hover:bg-blue-500 hover:text-white`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HandThumbUpIcon className="h-4 w-4 mr-1" />
          <span>{idea.votes?.length || 0}</span>
        </motion.button>
        <h4 className="font-semibold text-gray-800 mb-2 mt-8">{idea.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
          <span className="flex items-center">
            <UserIcon className="h-3 w-3 mr-1" />
            {idea.author.name}
          </span>
          <span className="flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" />
            {formatDate(idea.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <button 
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
            <span className="text-xs ml-1">{idea._count?.comments || 0}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(idea);
            }}
            className="text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center"
          >
            <ShareIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderKanbanView = () => (
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
      {(Object.keys(columns) as ColumnType[]).map((status) => (
        <div 
          key={status} 
          className="flex-1 min-w-0 p-4"
          onDragOver={isAdmin ? handleDragOver : undefined}
          onDrop={isAdmin ? (e) => handleDrop(e, status) : undefined}
        >
          <h3 className="text-xl font-semibold mb-4 capitalize">{status}</h3>
          <div
            className={`p-4 rounded-lg h-full border-2 overflow-y-auto ${getColumnStyle(status)}`}
          >
            {columns[status].map((idea) => (
              <div
                key={idea.id}
                draggable={isAdmin}
                onDragStart={isAdmin ? (e) => handleDragStart(e, idea) : undefined}
              >
                {renderIdea(idea)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {ideas.map((idea) => renderIdea(idea))}
    </div>
  );

  const renderMobileKanbanView = () => (
    <div className="flex flex-col h-full">
      <div className="flex mb-4 overflow-x-auto">
        {(Object.keys(columns) as ColumnType[]).map((status) => (
          <button
            key={status}
            onClick={() => setActiveColumn(status)}
            className={`px-4 py-2 mr-2 rounded-full text-sm font-medium ${
              activeColumn === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      <div
        className={`p-4 rounded-lg h-full border-2 overflow-y-auto ${getColumnStyle(activeColumn)}`}
      >
        {columns[activeColumn].map((idea) => (
          <div
            key={idea.id}
            draggable={isAdmin}
            onDragStart={isAdmin ? (e) => handleDragStart(e, idea) : undefined}
          >
            {renderIdea(idea)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {viewMode === 'kanban' ? (
        <div className="hidden md:block">{renderKanbanView()}</div>
      ) : (
        renderListView()
      )}
      <div className="md:hidden">
        {viewMode === 'kanban' ? renderMobileKanbanView() : renderListView()}
      </div>
      {selectedIdea && (
        <Modal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)} 
          formatDate={formatDate}
          onVote={handleVote}
          onDelete={onDelete}
          onAddComment={onAddComment}
          onUpdateStatus={onUpdateStatus}
          onShare={handleShare}
          isAdmin={isAdmin}
          session={session}
          hasVoted={votedIdeas.includes(selectedIdea.id)}
          showVoteConfirmation={showVoteConfirmation}
        />
      )}
      <AnimatePresence>
        {showConfirmation !== null && (
          <ConfirmationModal
            onConfirm={() => handleConfirmUnvote(showConfirmation)}
            onCancel={() => setShowConfirmation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(KanbanBoard);