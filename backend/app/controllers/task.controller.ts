import { TaskModel } from "../models/Task.ts";

export class TaskController {
  static async index() {
    return await TaskModel.all();
  }

  static async store(title: string){
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required");
    }

    if (title.length > 255) {
      throw new Error("Title must be 255 characters or less");
    }

    return await TaskModel.create(title.trim());
  }

  static async toggle(id: number) {
    if (!id || id <= 0) {
      throw new Error("Valid task ID is required");
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      throw new Error("Task not found");
    }

    return await TaskModel.update(id, { completed: !task.completed });
  }
}
