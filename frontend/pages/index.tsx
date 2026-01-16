import { useEffect, useState } from "react";
import styles from "./Home.module.css";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const errorHandler = (error: any) => {
    console.error("Error:", error);
    alert("An error occurred: " + error);
  }

  const fetchTasks = async () => {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ tasks { id title completed } }`,
      }),
    });
    const data = await res.json();

    const hasErrors = data.errors && data.errors.length > 0;
    if (hasErrors) {
      return errorHandler(data.errors[0].message);
    }

    setTasks(data.data.tasks);
  };

  const addTask = async () => {
    const title = prompt("Task?");
    if (!title) return;

    const res = await fetch("/api/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: `
        mutation CreateTask($title: String!) {
          createTask(title: $title) {
            id
            title
            completed
          }
        }
      `,
        variables: { title },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    const hasErrors = data.errors && data.errors.length > 0;
    if (hasErrors) {
      return errorHandler(data.errors[0].message);
    }

    await fetchTasks();
  };

  const toggleTask = async (id: string) => {

    const res = await fetch("/api/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: `
        mutation ToggleTask($id: ID!) {
          toggleTask(id: $id) {
            id
            completed
          }
        }
      `,
        variables: { id },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    const hasErrors = data.errors && data.errors.length > 0;
    if (hasErrors) {
      return errorHandler(data.errors[0].message);
    }

    await fetchTasks();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tasks</h1>
      <p className={styles.subtitle}>Click to complete the task</p>

      <button className={styles.addButton} onClick={addTask}>
        + Add Task
      </button>

      <div className={styles.list}>
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggleTask(t.id)}
            className={`${styles.task} ${t.completed ? styles.taskCompleted : ""
              }`}
          >
            <span>{t.title}</span>
            <span className={styles.status}>
              {t.completed ? "✓ Done" : "• Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
