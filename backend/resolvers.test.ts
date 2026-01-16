import { resolvers } from './resolvers';
import db from './db';

jest.mock('./db', () => jest.fn());

const mockDb = db as unknown as jest.Mock;

describe('Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.tasks', () => {
    it('should return all tasks ordered by id', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];
      
      mockDb.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockTasks),
      });

      const result = await resolvers.Query.tasks();
      expect(result).toEqual(mockTasks);
    });
  });

  describe('Mutation.createTask', () => {
    it('should create a task with valid title', async () => {
      const mockTask = { id: 1, title: 'New Task', completed: false };
      
      mockDb.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockTask]),
      });

      const result = await resolvers.Mutation.createTask(null, { title: 'New Task' });
      expect(result).toEqual(mockTask);
    });

    it('should throw error if title is empty', async () => {
      await expect(
        resolvers.Mutation.createTask(null, { title: '' })
      ).rejects.toThrow('Title is required');
    });

    it('should throw error if title is whitespace only', async () => {
      await expect(
        resolvers.Mutation.createTask(null, { title: '   ' })
      ).rejects.toThrow('Title is required');
    });

    it('should throw error if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);
      await expect(
        resolvers.Mutation.createTask(null, { title: longTitle })
      ).rejects.toThrow('Title must be 255 characters or less');
    });

    it('should trim whitespace from title', async () => {
      const mockTask = { id: 1, title: 'Trimmed Task', completed: false };
      const insertMock = jest.fn().mockReturnThis();
      
      mockDb.mockReturnValue({
        insert: insertMock,
        returning: jest.fn().mockResolvedValue([mockTask]),
      });

      await resolvers.Mutation.createTask(null, { title: '  Trimmed Task  ' });
      expect(insertMock).toHaveBeenCalledWith({ title: 'Trimmed Task', completed: false });
    });
  });

  describe('Mutation.toggleTask', () => {
    it('should toggle task completion status', async () => {
      const mockTask = { id: 1, title: 'Task', completed: false };
      const updatedTask = { id: 1, title: 'Task', completed: true };
      
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockTask),
        update: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([updatedTask]),
      });

      const result = await resolvers.Mutation.toggleTask(null, { id: 1 });
      expect(result).toEqual(updatedTask);
    });

    it('should throw error if task not found', async () => {
      mockDb.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null),
      });

      await expect(
        resolvers.Mutation.toggleTask(null, { id: 999 })
      ).rejects.toThrow('Task not found');
    });

    it('should throw error if id is invalid', async () => {
      await expect(
        resolvers.Mutation.toggleTask(null, { id: 0 })
      ).rejects.toThrow('Valid task ID is required');

      await expect(
        resolvers.Mutation.toggleTask(null, { id: -1 })
      ).rejects.toThrow('Valid task ID is required');
    });
  });
});
