import { create } from 'zustand';

const EMPTY_FORM = {
  name: '',
  phone: '',
  address: '',
  notes: '',
};

export const useMastersStore = create((set) => ({
  activeTab: 'customer',
  searchQuery: '',
  currentPage: 1,
  formValues: { ...EMPTY_FORM },

  setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  /* ─── Form Actions ─── */
  handleFieldChange: (name, value) =>
    set((state) => ({ formValues: { ...state.formValues, [name]: value } })),
  
  resetForm: () => set({ formValues: { ...EMPTY_FORM } }),
}));
