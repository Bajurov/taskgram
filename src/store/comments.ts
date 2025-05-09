import { defineStore } from 'pinia';
import * as commentsApi from '../api/commentsApi';
import { Comment } from '../types';

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [] as Comment[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchComments(taskId: string) {
      this.loading = true;
      try {
        this.comments = await commentsApi.getComments(taskId);
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки комментариев';
      } finally {
        this.loading = false;
      }
    },
    async addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
      await commentsApi.addComment(comment);
      await this.fetchComments(comment.taskId);
    }
  }
}); 