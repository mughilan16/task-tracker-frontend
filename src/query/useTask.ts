import { createTask, getTasks, Data, completeTask } from "../api/task";
import { useQuery, useQueryClient, useMutation } from "react-query";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess(res) {
      queryClient.setQueriesData<Data>(
        "tasks",
        (data) => {
          if (data === undefined) return {tasks: new Array(), currentTask: res}
          return {tasks: data.tasks, currentTask: res};
        },
      );
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeTask,
    onSuccess(res) {
      console.log(res)
      queryClient.setQueryData<Data>(
        "tasks",
        (data) => {
          if (data === undefined) return {tasks: [res], currentTask: null}
          return {tasks: [...data.tasks, res], currentTask: null}
        }
      )
    }
  })
}
