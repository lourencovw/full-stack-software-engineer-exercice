import { TaskController } from '../app/controllers/task.controller';
import db from '../config/database';

jest.mock('../config/database', () => jest.fn());

const mockDb = db as unknown as jest.Mock;

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('index', () => {
    it('should return all tasks ordered by id', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];
      
      mockDb.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockTasks),
      });

      const result = await TaskController.index();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('store', () => {
    it('should create a task with valid title', async () => {
      const mockTask = { id: 1, title: 'New Task', completed: false };
      
      mockDb.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      });

      const result = await TaskController.store('New Task');
      expect(result).toEqual(mockTask);
    });

    it('should throw error if title is empty', async () => {
      await expect(
        TaskController.store('')
      ).rejects.toThrow('Title is required');
    });

    it('should throw error if title is whitespace only', async () => {
      await expect(
        TaskController.store('   ')
      ).rejects.toThrow('Title is required');
    });

    it('should throw error if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);
      await expect(
        TaskController.store(longTitle)
      ).rejects.toThrow('Title must be 255 characters or less');
    });

    it('should trim whitespace from title', async () => {
      const mockTask = { id: 1, title: 'Trimmed Task', completed: false };
      const insertMock = jest.fn().mockReturnThis();
      
      mockDb.mockReturnValue({
        insert: insertMock,
        returning: jest.fn().mockResolvedValue([mockTask]),
      });

      await TaskController.store('  Trimmed Task  ');
      expect(insertMock).toHaveBeenCalledWith({ title: 'Trimmed Task', completed: false });
    });
  });

  describe('toggle', () => {
    it('should toggle task completion status', async () => {
      const mockTask = { id: 1, title: 'Task', completed: false };
      const updatedTask = { id: 1, title: 'Task', completed: true };
      
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockTask),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedTask]),
      });

      const result = await TaskController.toggle(1);
      expect(result).toEqual(updatedTask);
    });

    it('should throw error if task not found', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(
        TaskController.toggle(999)
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if id is invalid', async () => {
      await expect(
        TaskController.toggle(0)
      ).rejects.toThrow('Valid task ID is required');

      await expect(
        TaskController.toggle(-1)
      ).rejects.toThrow('Valid task ID is required');
    });
  });
});
