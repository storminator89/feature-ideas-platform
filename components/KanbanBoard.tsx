import React, { useState, useEffect, useCallback } from 'react';
import { Session } from 'next-auth';
import { HandThumbUpIcon, ChatBubbleLeftEllipsisIcon, TrashIcon, UserIcon, ClockIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  votes: any[];
  _count: {
    comments: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface KanbanBoardProps {
  ideas: Idea[];
  onVote: (ideaId: number) => Promise<void>;
  onDelete: (ideaId: number) => Promise<void>;
  onUpdateStatus: (ideaId: number, newStatus: 'pending' | 'approved' | 'rejected') => Promise<void>;
  session: Session | null;
}

type ColumnType = 'pending' | 'approved' | 'rejected';

const KanbanBoard: React.FC<KanbanBoardProps> = ({ ideas: initialIdeas, onVote, onDelete, onUpdateStatus, session }) => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [expandedIdea, setExpandedIdea] = useState<number | null>(null);
  const [draggedIdea, setDraggedIdea] = useState<Idea | null>(null);

  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    setIdeas(initialIdeas);
  }, [initialIdeas]);

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

    const updatedIdeas = ideas.map(idea =>
      idea.id === draggedIdea.id ? { ...idea, status: newStatus } : idea
    );

    setIdeas(updatedIdeas);

    try {
      await onUpdateStatus(draggedIdea.id, newStatus);
    } catch (error) {
      console.error('Failed to update idea status:', error);
      setIdeas(initialIdeas); // Revert to original state if API call fails
    }

    setDraggedIdea(null);
  };

  const toggleExpand = useCallback((ideaId: number) => {
    setExpandedIdea(prevId => prevId === ideaId ? null : ideaId);
  }, []);

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

  return (
    <div className="flex h-full overflow-hidden">
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
                className={`bg-white p-4 mb-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 ${isAdmin ? 'cursor-move' : ''}`}
              >
                <h4 className="font-semibold text-gray-800 mb-2">{idea.title}</h4>
                <p className={`text-sm text-gray-600 mb-3 ${expandedIdea === idea.id ? '' : 'line-clamp-2'}`}>
                  {idea.description}
                </p>
                {idea.description.length > 100 && (
                  <button
                    onClick={() => toggleExpand(idea.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mb-2"
                  >
                    {expandedIdea === idea.id ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Read more
                      </>
                    )}
                  </button>
                )}
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
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {idea.category.name}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onVote(idea.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span className="text-xs ml-1">{idea.votes.length}</span>
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center">
                      <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                      <span className="text-xs ml-1">{idea._count.comments}</span>
                    </button>
                    {(session?.user?.email === idea.author.email || isAdmin) && (
                      <button
                        onClick={() => onDelete(idea.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(KanbanBoard);