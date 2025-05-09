import { defineStore } from 'pinia';
import { Project } from '../types';
import { projects } from '../api/mockData';

export const useProjectsStore = defineStore('projects', {
  state: () => ({
    projects: [...projects] as Project[]
  }),
  getters: {
    activeProjects: (state) => state.projects.filter(p => p.status === 'active'),
    archivedProjects: (state) => state.projects.filter(p => p.status === 'archived')
  },
  actions: {
    addProject(project: Project) {
      this.projects.push(project);
    },
    updateProject(project: Project) {
      const idx = this.projects.findIndex(p => p.id === project.id);
      if (idx !== -1) this.projects[idx] = project;
    },
    archiveProject(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (project) project.status = 'archived';
    },
    activateProject(id: string) {
      const project = this.projects.find(p => p.id === id);
      if (project) project.status = 'active';
    }
  }
}); 