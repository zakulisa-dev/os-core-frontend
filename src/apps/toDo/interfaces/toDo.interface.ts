export interface ToDoItem {
  id: string;
  heading: string;
  isComplete: boolean;
  description: string;
  updatedAt?: string;
  createAt?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  tags?: string[];
}
