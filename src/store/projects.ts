import { defineStore } from 'pinia';
import { Project } from '../types';
import * as projectsApi from '../api/projectsApi';

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [] as Project[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
    archivedProjects: (state) => state.projects.filter(p => p.status === 'archived')
  },
  actions: {
    async fetchProjects() {
      this.loading = true;
      try {
        this.projects = await projectsApi.getProjects();
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки проектов';
      } finally {
        this.loading = false;
      }
    },
    async addProject(project: Project) {
      await projectsApi.addProject(project);
      await this.fetchProjects();
    },
    async updateProject(project: Project) {
      await projectsApi.updateProject(project);
      await this.fetchProjects();
    },
    async archiveProject(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (project) {
        project.status = 'archived';
        await this.updateProject(project);
      }
    },
    async activateProject(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (project) {
        project.status = 'active';
        await this.updateProject(project);
      }
    },
    async deleteProject(id: string) {
      await projectsApi.deleteProject(id);
      await this.fetchProjects();
    }
  }
}); 