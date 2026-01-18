interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export const fetchTasks = async (): Promise<Task[]> => {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `{ tasks { id title completed } }`,
    }),
  });
  const data = await res.json();

  if (data.errors && data.errors.length > 0) {
    throw new Error(data.errors[0].message);
  }

  return data.data.tasks;
};

export const createTask = async (title: string): Promise<Task> => {
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

  if (data.errors && data.errors.length > 0) {
    throw new Error(data.errors[0].message);
  }

  return data.data.createTask;
};

export const toggleTask = async (id: string): Promise<Task> => {
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

  if (data.errors && data.errors.length > 0) {
    throw new Error(data.errors[0].message);
  }

  return data.data.toggleTask;
};