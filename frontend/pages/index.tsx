import { useEffect, useState, useCallback } from "react";
import styles from "./Home.module.css";
import { TaskItem } from "../components/TaskItem";
import * as api from "../api/tasks";
import { ITask } from "../types/task";

export default function Home() {
  const [tasks, setTasks] = useState<ITask[]>([]);

  const errorHandler = (error: unknown) => {
    alert("An error occurred: " + error);
  };

  const fetchTasks = useCallback(async () => {
    try {
      const tasks = await api.fetchTasks();
      setTasks(tasks);
    } catch (error: unknown) {
      errorHandler(error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async () => {
    const title = prompt("Task?");
    if (!title) return;

    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticTask: ITask = {
      id: tempId,
      title: title.trim(),
      completed: false,
    };
    setTasks(prev => [...prev, optimisticTask]);

    try {
      await api.createTask(title);
      await fetchTasks(); // Sync with server
    } catch (error) {
      // Revert optimistic update on error
      setTasks(prev => prev.filter(task => task.id !== tempId));
      errorHandler(error);
    }
  }, [fetchTasks]);

  const handleToggleTask = useCallback(async (id: string) => {
    // Optimistic update
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));

    try {
      await api.toggleTask(id);
      await fetchTasks(); // Sync with server
    } catch (error) {
      // Revert optimistic update on error
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
      errorHandler(error);
    }
  }, [fetchTasks]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks</h1>
      <p className={styles.subtitle}>Click to complete the task</p>

      <button className={styles.addButton} onClick={addTask}>
        + Add Task
      </button>

      <div className={styles.list}>
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={handleToggleTask} />
        ))}
      </div>
    </div>
  );
}