import db from "./db.ts";

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface CreateTaskArgs {
  title: string;
}

interface ToggleTaskArgs {
  id: number;
}

export const resolvers = {
  Query: {
    tasks: async (): Promise<Task[]> => {
      return await db<Task>("tasks").select("*").orderBy("id", "asc");     
    },
  },

  Mutation: {
    createTask: async (_: unknown,{ title }: CreateTaskArgs): Promise<Task> => {
      if (!title || title.trim().length === 0) {
        throw new Error("Title is required");
      }

      if (title.length > 255) {
        throw new Error("Title must be 255 characters or less");
      }

      const [task] = await db<Task>("tasks")
        .insert({ title: title.trim(), completed: false })
        .returning("*");

      return task;
    },

    toggleTask: async (_: unknown,{ id }: ToggleTaskArgs): Promise<Task> => {
      if (!id || id <= 0) {
        throw new Error("Valid task ID is required");
      }

      const task = await db<Task>("tasks")
        .where({ id })
        .first();

      if (!task) {
        throw new Error("Task not found");
      }

      const [updated] = await db<Task>("tasks")
        .where({ id })
        .update({ completed: !task.completed })
        .returning("*");

      return updated;
    },
  },
};
