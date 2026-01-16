import { TaskController } from "../app/controllers/task.controller.ts";

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
    tasks: async () => await TaskController.index(),
  },
  Mutation: {
    createTask: async (_: unknown, { title }: CreateTaskArgs) =>
      await TaskController.store(title),
    toggleTask: async (_: unknown, { id }: ToggleTaskArgs) =>
      await TaskController.toggle(id),
  },
};
