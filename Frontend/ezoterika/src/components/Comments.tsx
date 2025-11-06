'use client';

import { useState, useEffect } from 'react';
import { getComments, createComment, createReply } from '@/lib/api';

interface Comment {
  id: string;
  text: string;
  author: string;
  author_avatar?: string;
  created_at: string;
  replies?: Comment[];
  parent_id?: string;
}

interface CommentsProps {
  postId: string;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    loadComments();
  }, [postId, sortOrder]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = await getComments(postId, sortOrder);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback к пустому списку при ошибке
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await createComment(postId, newComment);
      
      if (response.comment) {
        // Перезагружаем комментарии для получения актуального списка
        await loadComments();
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Ошибка при отправке комментария');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await createReply(parentId, replyText);
      
      if (response.comment) {
        // Перезагружаем комментарии для получения актуального списка
        await loadComments();
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Ошибка при отправке ответа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long'
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-6'}`}>
      <div className="flex space-x-3">
        {/* Аватар */}
        <div className="shrink-0">
          {comment.author_avatar ? (
            <img
              src={comment.author_avatar}
              alt={comment.author}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#8A63D2] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Содержимое комментария */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-white">{comment.author}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
          
          {/* Кнопка ответа */}
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ответить
            </button>
          )}

          {/* Форма ответа */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Написать ответ..."
                  className="flex-1 px-3 py-2 bg-[#2A1F3D] border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#8A63D2]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !replyText.trim()}
                  className="px-4 py-2 bg-[#8A63D2] text-white text-sm rounded-lg hover:bg-[#7A53C2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '...' : 'Отправить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
              </div>
            </form>
          )}

          {/* Ответы */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-[#1A1826] rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-600 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-600 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-600 rounded w-full"></div>
                  <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1826] rounded-lg p-4 sm:p-6">
      {/* Заголовок и сортировка */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Комментарии {comments.length}
        </h3>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-2 bg-[#2A1F3D] border border-gray-600 rounded text-white text-xs sm:text-sm focus:outline-none focus:border-[#8A63D2] w-full sm:w-auto"
        >
          <option value="newest">Сначала новые</option>
          <option value="oldest">Сначала старые</option>
        </select>
      </div>

      {/* Форма нового комментария */}
      <form onSubmit={handleSubmitComment} className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Написать комментарий"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#2A1F3D] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#8A63D2] text-white rounded-lg active:bg-[#7A53C2] sm:hover:bg-[#7A53C2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation text-sm sm:text-base whitespace-nowrap"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>

      {/* Список комментариев */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">Пока нет комментариев. Будьте первым!</p>
          </div>
        )}
      </div>
    </div>
  );
}
