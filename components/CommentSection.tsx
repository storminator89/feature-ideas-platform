import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();

  useEffect(() => {
    fetchComments();
  }, [ideaId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?ideaId=${ideaId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
        onCommentCountChange(data.length);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
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

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      {session ? (
        <form onSubmit={handleSubmitComment} className="mt-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Add a comment..."
            disabled={isSubmitting}
          ></textarea>
          <button
            type="submit"
            className={`mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-gray-600">Please sign in to leave a comment.</p>
      )}
      <div className="mt-6 space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{comment.user.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;