import { useMutation, useQuery, useQueryClient } from "react-query";
import { createProject, getProjects, Data } from "../api/project";

export function useGetProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess(res) {
      queryClient.setQueriesData<Data>(
        "projects",
        (data) => {
          if (data === undefined) return { projects: new Array() };
          return { projects: [...data.projects, res] };
        },
      );
    },
  });
}
