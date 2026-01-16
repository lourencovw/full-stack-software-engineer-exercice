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
      return await db<Task>("tasks").select("*");     
    },
  },

  Mutation: {
    createTask: async (
      _: unknown,
      { title }: CreateTaskArgs
    ): Promise<Task> => {
      const [task] = await db<Task>("tasks")
        .insert({ title, completed: false })
        .returning("*");

      return task;
    },

    toggleTask: async (
      _: unknown,
      { id }: ToggleTaskArgs
    ): Promise<Task> => {
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
