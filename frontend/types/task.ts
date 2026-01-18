export interface ITask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ITaskItemProps {
  task: ITask;
  onToggle: (id: string) => void;
}
