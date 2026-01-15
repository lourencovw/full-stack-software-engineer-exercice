import { useEffect, useState } from "react";

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

  const fetchTasks = async () => {
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{ tasks { id title completed } }`,
      }),
    });
    const data = await res.json();

    setTasks(data.data.tasks);
  };

  const addTask = async () => {
    const title = prompt("Task?");
    if (!title) return;

    await fetch("/api/graphql", {
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

    await fetchTasks();
  };

  const toggleTask = async (id: string) => {

    await fetch("/api/graphql", {
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

    await fetchTasks();
  };

  return (
    <div>
      <h1>Tasks</h1>
      <p>Click to complete the task</p>
      <button onClick={addTask}>Add</button>

      {tasks?.map((t: any) => (
        <div
          key={t.id}
          onClick={() => toggleTask(t.id)}
          style={{ cursor: "pointer" }}
        >
          {t.title} — {t.completed ? "Done" : "Pending"}
        </div>
      ))}
    </div>
  );
}
