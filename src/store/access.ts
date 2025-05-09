import { defineStore } from 'pinia';
import { supabase } from '../supabaseClient';

interface Access {
  id: string;
  url: string;
  login: string;
  password: string;
  comment?: string;
  projectid: string;
}

export const useAccessStore = defineStore('access', {
  state: () => ({
    accesses: [] as Access[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAccesses(projectid: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase
          .from('accesses')
          .select('*')
          .eq('projectid', projectid);

        if (error) throw error;
        this.accesses = data || [];
      } catch (e) {
        this.error = e?.message || 'Failed to fetch accesses';
        console.error('Error fetching accesses:', e);
      } finally {
        this.loading = false;
      }
    },

    async addAccess(access: Access) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await supabase
          .from('accesses')
          .insert([access]);

        if (error) throw error;
        this.accesses.push(access);
      } catch (e) {
        this.error = e?.message || 'Failed to add access';
        console.error('Error adding access:', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async removeAccess(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await supabase
          .from('accesses')
          .delete()
          .eq('id', id);

        if (error) throw error;
        this.accesses = this.accesses.filter(access => access.id !== id);
      } catch (e) {
        this.error = e?.message || 'Failed to remove access';
        console.error('Error removing access:', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async updateAccess(access: Access) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await supabase
          .from('accesses')
          .update(access)
          .eq('id', access.id);

        if (error) throw error;
        const index = this.accesses.findIndex(a => a.id === access.id);
        if (index !== -1) {
          this.accesses[index] = access;
        }
      } catch (e) {
        this.error = e?.message || 'Failed to update access';
        console.error('Error updating access:', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },
  },
}); 