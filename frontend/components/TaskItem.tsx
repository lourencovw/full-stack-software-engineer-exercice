import styles from "../pages/Home.module.css";
import { ITaskItemProps } from "../types/task";

export const TaskItem = ({ task, onToggle }: ITaskItemProps) => (
  <div
    onClick={() => onToggle(task.id)}
    className={`${styles.task} ${task.completed ? styles.taskCompleted : ""}`}
  >
    <span>{task.title}</span>
    <span className={styles.status}>
      {task.completed ? "✓ Done" : "• Pending"}
    </span>
  </div>
);

TaskItem.displayName = 'TaskItem';