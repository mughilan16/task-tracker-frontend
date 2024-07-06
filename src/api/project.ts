import axios from "axios"

export type Data = {
  projects: Array<Project>
}

export type Project = {
  id: number,
  name: string,
  tag: string
}

export type ProjectRequest = {
  name: string,
  tag: string
}

export const getProjects = async () => {
  return axios.get<Data>("http://localhost:5078/api/project")
    .then(res => res.data)
}

export const createProject = async (req: ProjectRequest) => {
  return axios.post<Project>("http://localhost:5078/api/project/new", {
    name: req.name,
    tag: req.tag
  }).then(res => res.data)
}

