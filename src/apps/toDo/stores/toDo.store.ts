import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Обновленный интерфейс ToDoItem
export interface ToDoItem {
  id: string;
  heading: string;
  isComplete: boolean;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt?: string;
  tags?: string[];
}

// Новые типы для фильтрации и сортировки
export type FilterType = 'all' | 'active' | 'completed' | 'overdue';
export type SortType = 'createdAt' | 'dueDate' | 'priority' | 'heading' | 'category';
export type SortOrder = 'asc' | 'desc';

// Интерфейс для статистики
export interface ToDoStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  byCategory: Record<string, number>;
  completionRate: number;
}

interface ToDoState {
  // Существующие поля
  toDoList: ToDoItem[];
  activeToDoPage: string;
  isToDoListLoading: boolean;
  toDoListError: string;
  isUpdateLoading: boolean;
  updateError: string;
  isDeleteLoading: boolean;
  deleteError: string;
  isAddLoading: boolean;
  addError: string;

  // Новые поля для фильтрации и поиска
  searchQuery: string;
  currentFilter: FilterType;
  currentSort: SortType;
  sortOrder: SortOrder;
  selectedCategories: string[];
  selectedPriorities: ('low' | 'medium' | 'high')[];

  // Существующие методы
  changeActiveToDoPage: (page: string) => void;
  closeToDoUpdateError: () => void;
  closeToDoAddError: () => void;
  addToDoItemLocal: (heading: string, options?: Partial<ToDoItem>) => void;
  deleteToDoItemLocal: (id: string) => void;
  updateToDoItemLocal: (item: ToDoItem) => void;
  addToDoItem: (heading: string, options?: Partial<ToDoItem>) => Promise<void>;
  deleteToDoItem: (id: string) => Promise<void>;
  getToDoItems: () => Promise<void>;
  updateToDoItem: (item: ToDoItem) => Promise<void>;

  // Новые методы
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FilterType) => void;
  setSort: (sort: SortType, order?: SortOrder) => void;
  toggleSortOrder: () => void;
  setSelectedCategories: (categories: string[]) => void;
  setSelectedPriorities: (priorities: ('low' | 'medium' | 'high')[]) => void;
  clearAllFilters: () => void;

  // Геттеры для обработанных данных
  getFilteredTasks: () => ToDoItem[];
  getStats: () => ToDoStats;
  getCategories: () => string[];

  // Bulk операции
  toggleMultipleTasks: (ids: string[], completed: boolean) => void;
  deleteMultipleTasks: (ids: string[]) => void;
  clearCompleted: () => void;
  clearCompletedItems: () => void;
}

const useToDoStore = create<ToDoState>()((set, get) => ({
  // Существующие поля
  toDoList: (localStorage.getItem('toDoList') && JSON.parse(localStorage.getItem('toDoList')!)) || [],
  activeToDoPage: '',
  isToDoListLoading: false,
  toDoListError: '',
  isUpdateLoading: false,
  updateError: '',
  isDeleteLoading: false,
  deleteError: '',
  isAddLoading: false,
  addError: '',

  // Новые поля
  searchQuery: '',
  currentFilter: 'all',
  currentSort: 'createdAt',
  sortOrder: 'desc',
  selectedCategories: [],
  selectedPriorities: [],

  // Существующие методы
  changeActiveToDoPage: (page: string) => {
    set({ activeToDoPage: page });
  },

  closeToDoUpdateError: () => {
    set({ updateError: '' });
  },

  closeToDoAddError: () => {
    set({ addError: '' });
  },

  addToDoItemLocal: (heading: string, options: Partial<ToDoItem> = {}) => {
    const newItem: ToDoItem = {
      id: uuidv4(),
      heading,
      isComplete: false,
      description: '',
      priority: options.priority || 'medium',
      category: options.category || '',
      createdAt: new Date().toISOString(),
      dueDate: options.dueDate,
      tags: options.tags || [],
      ...options,
    };

    set((state) => {
      const updatedList = [...state.toDoList, newItem];
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  deleteToDoItemLocal: (id: string) => {
    set((state) => {
      const updatedList = state.toDoList.filter((item) => item.id !== id);
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  updateToDoItemLocal: (updatedItem: ToDoItem) => {
    set((state) => {
      const updatedList = state.toDoList.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  addToDoItem: async (heading: string, options: Partial<ToDoItem> = {}) => {
    set({ isAddLoading: true, addError: '' });

    try {
      const newItem = {
        heading,
        priority: options.priority || 'medium',
        category: options.category || '',
        dueDate: options.dueDate,
        tags: options.tags || [],
        ...options,
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/toDo/items`,
        newItem,
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      if (res.data.isSuccess) {
        set((state) => ({
          isAddLoading: false,
          addError: '',
          toDoList: [
            ...state.toDoList,
            { ...res.data.toDoItem, id: res.data.toDoItem.id.toString() }
          ]
        }));
      } else {
        set({ isAddLoading: false, addError: 'Error' });
      }
    } catch (error) {
      set({ isAddLoading: false, addError: 'Error' });
    }
  },

  deleteToDoItem: async (id: string) => {
    set({ isDeleteLoading: true, deleteError: '' });

    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/toDo/items?id=${id}`,
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      if (res.data.isSuccess) {
        set((state) => ({
          isDeleteLoading: false,
          deleteError: '',
          toDoList: state.toDoList.filter((item) => item.id !== res.data.id.toString())
        }));
      } else {
        set({ isDeleteLoading: false, deleteError: 'Error' });
      }
    } catch (error) {
      set({ isDeleteLoading: false, deleteError: 'Error' });
    }
  },

  getToDoItems: async () => {
    set({ isToDoListLoading: true, toDoListError: '' });

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/toDo/items`,
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      const sortedItems = res.data.sort((prev: ToDoItem, current: ToDoItem) => +prev.id - +current.id);

      set({
        isToDoListLoading: false,
        toDoListError: '',
        toDoList: sortedItems
      });
    } catch (error) {
      set({ isToDoListLoading: false, toDoListError: 'Error' });
    }
  },

  updateToDoItem: async (item: ToDoItem) => {
    set({ isUpdateLoading: true, updateError: '' });

    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/toDo/items`,
        { ...item, id: +item.id },
        {
          withCredentials: true,
          timeout: 30000,
        }
      );

      if (res.data.isSuccess) {
        set((state) => ({
          isUpdateLoading: false,
          updateError: '',
          toDoList: state.toDoList.map((todoItem) =>
            todoItem.id === res.data.toDoItem.id ? res.data.toDoItem : todoItem
          )
        }));
      } else {
        set({ isUpdateLoading: false, updateError: 'Error' });
      }
    } catch (error) {
      set({ isUpdateLoading: false, updateError: 'Error' });
    }
  },

  clearCompleted: () => {
    set((state) => {
      const updatedList = state.toDoList.filter(item => !item.isComplete);
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  clearCompletedItems: () => {
    set((state) => {
      const updatedList = state.toDoList.filter(item => !item.isComplete);
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  // Новые методы для фильтрации и поиска
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setFilter: (filter: FilterType) => {
    set({ currentFilter: filter });
  },

  setSort: (sort: SortType, order: SortOrder = 'desc') => {
    set({ currentSort: sort, sortOrder: order });
  },

  toggleSortOrder: () => {
    set((state) => ({
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  },

  setSelectedCategories: (categories: string[]) => {
    set({ selectedCategories: categories });
  },

  setSelectedPriorities: (priorities: ('low' | 'medium' | 'high')[]) => {
    set({ selectedPriorities: priorities });
  },

  clearAllFilters: () => {
    set({
      searchQuery: '',
      currentFilter: 'all',
      selectedCategories: [],
      selectedPriorities: [],
    });
  },

  // Геттер для фильтрованных и отсортированных задач
  getFilteredTasks: () => {
    const state = get();
    let filtered = [...state.toDoList];

    // Поиск по тексту
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.heading.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Фильтр по статусу
    switch (state.currentFilter) {
      case 'active':
        filtered = filtered.filter(item => !item.isComplete);
        break;
      case 'completed':
        filtered = filtered.filter(item => item.isComplete);
        break;
      case 'overdue':
        const now = new Date();
        filtered = filtered.filter(item =>
          !item.isComplete &&
          item.dueDate &&
          new Date(item.dueDate) < now
        );
        break;
    }

    // Фильтр по категориям
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(item =>
        item.category && state.selectedCategories.includes(item.category)
      );
    }

    // Фильтр по приоритетам
    if (state.selectedPriorities.length > 0) {
      filtered = filtered.filter(item =>
        item.priority && state.selectedPriorities.includes(item.priority)
      );
    }

    // Сортировка
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (state.currentSort) {
        case 'heading':
          comparison = a.heading.localeCompare(b.heading);
          break;
        case 'createdAt':
          const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
          comparison = aDate.getTime() - bDate.getTime();
          break;
        case 'dueDate':
          const aDue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          const bDue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          comparison = aDue.getTime() - bDue.getTime();
          break;
        case 'priority':
          const aPriority = priorityOrder[a.priority || 'medium'];
          const bPriority = priorityOrder[b.priority || 'medium'];
          comparison = aPriority - bPriority;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
      }

      return state.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  },

  // Геттер для статистики
  getStats: (): ToDoStats => {
    const state = get();
    const total = state.toDoList.length;
    const completed = state.toDoList.filter(item => item.isComplete).length;
    const active = total - completed;

    const now = new Date();
    const overdue = state.toDoList.filter(item =>
      !item.isComplete &&
      item.dueDate &&
      new Date(item.dueDate) < now
    ).length;

    const byPriority = state.toDoList.reduce((acc, item) => {
      const priority = item.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    const byCategory = state.toDoList.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      completed,
      overdue,
      byPriority,
      byCategory,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  // Геттер для получения всех категорий
  getCategories: () => {
    const state = get();
    const categories = state.toDoList
      .map(item => item.category)
      .filter((category): category is string => Boolean(category))
      .filter((category, index, array) => array.indexOf(category) === index)
      .sort();

    return categories;
  },

  // Bulk операции
  toggleMultipleTasks: (ids: string[], completed: boolean) => {
    set((state) => {
      const updatedList = state.toDoList.map(item =>
        ids.includes(item.id) ? { ...item, isComplete: completed } : item
      );
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },

  deleteMultipleTasks: (ids: string[]) => {
    set((state) => {
      const updatedList = state.toDoList.filter(item => !ids.includes(item.id));
      localStorage.setItem('toDoList', JSON.stringify(updatedList));
      return { toDoList: updatedList };
    });
  },
}));

export default useToDoStore;