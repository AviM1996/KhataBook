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

  isModalOpen: false,
  editId: null,
  recordType: 'CUSTOMER',    

  formValues: { ...EMPTY_FORM },
  setActiveTab: (tab) => set({ activeTab: tab, currentPage: 1, searchQuery: '' }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),

  /* ─── Form Actions ─── */
  handleFieldChange: (name, value) =>
    set((state) => ({ formValues: { ...state.formValues, [name]: value } })),

  /* ─── Modal Actions ─── */
  openCreateModal: (recordType = 'CUSTOMER') =>
    set({
      isModalOpen: true,
      editId: null,
      recordType,
      formValues: { ...EMPTY_FORM },
    }),

  openEditModal: (item, recordType = 'CUSTOMER') =>
    set({
      isModalOpen: true,
      editId: item._id || item.id,
      recordType,
      formValues: {
        name: item.name || '',
        phone: item.phone || '',
        address: item.address || '',
        notes: item.notes || '',
      },
    }),

  closeModal: () => set({ isModalOpen: false, editId: null }),
}));
