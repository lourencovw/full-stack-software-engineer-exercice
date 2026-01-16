import db from '../../config/database.ts';

interface ITask {
  id: number;
  title: string;
  completed: boolean;
}

export class TaskModel {
  static async all(): Promise<ITask[]> {
    return await db<ITask>("tasks").select("*").orderBy("id", "asc");
  }

  static async create(title: string): Promise<ITask> {
    const [task] = await db<ITask>("tasks")
      .insert({ title, completed: false })
      .returning("*");
    return task;
  }

  static async findById(id: number): Promise<ITask | undefined> {
    return await db<ITask>("tasks").where({ id }).first();
  }

  static async update(id: number, data: Partial<ITask>): Promise<ITask> {
    const [task] = await db<ITask>("tasks")
      .where({ id })
      .update(data)
      .returning("*");
    return task;
  }
}
