import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChatBubbleLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
  };
}

interface CommentSectionProps {
  ideaId: number;
  onCommentCountChange: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ ideaId, onCommentCountChange }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, [ideaId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?ideaId=${ideaId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        onCommentCountChange(data.length);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          ideaId: ideaId,
        }),
      });

      if (response.ok) {
        const createdComment = await response.json();
        setComments((prevComments) => {
          const updatedComments = [createdComment, ...prevComments];
          onCommentCountChange(updatedComments.length);
          return updatedComments;
        });
        setNewComment('');
      } else {
        throw new Error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <ChatBubbleLeftIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Comments ({comments.length})
        </h3>
        {session ? (
          <form onSubmit={handleSubmitComment} className="mt-4">
            <div className="flex items-start space-x-4">
              <div className="min-w-0 flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  rows={3}
                  placeholder="Add a comment..."
                  disabled={isSubmitting}
                ></textarea>
              </div>
              <button
                type="submit"
                className={`inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 text-gray-600 bg-gray-100 p-4 rounded-md">Please sign in to leave a comment.</p>
        )}
        <div className="mt-6 space-y-6">
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {comment.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{comment.user.name}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    <p>{comment.content}</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;