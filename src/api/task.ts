import axios from "axios";

export type Task = {
  id: number,
  message: string,
  date: Date,
  startTime: Date,
  stopTime: Date,
  total: number,
  tag: string,
}

export type IncompleteTask = {
  id: number,
  message: string,
  date: Date,
  startTime: Date,
  tag: string
  projectId: number
}

export type Data = {
  tasks: Array<Task>,
  currentTask: IncompleteTask | null,
}

export const getTasks = async () => {
  return axios.get<Data>("http://localhost:5078/api/task")
    .then(res => res.data);
};

export const createTask = async (req: { message: string, tag: string, projectId: number | null }) => {
  return axios.post<IncompleteTask>("http://localhost:5078/api/task/create", {
    message: req.message,
    tag: req.tag,
    project: req.projectId
  }).then(res => res.data);
}

export const completeTask = async () => {
  return axios.patch<Task>("http://localhost:5078/api/task/complete")
    .then(res => res.data);
}
