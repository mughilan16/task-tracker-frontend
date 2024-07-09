import { SetStateAction, useEffect, useState } from 'react';
import { IncompleteTask, Task } from './api/task';
import { useCompleteTask, useCreateTask, useTasks } from './query/useTask'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import relativeTime from "dayjs/plugin/relativeTime"
import duration from "dayjs/plugin/duration"
import dayjs from 'dayjs';
import { useCreateProject, useGetProjects } from './query/useProject';
import { Modal } from '@mui/material';
dayjs.extend(relativeTime);
dayjs.extend(duration);

function App() {
  const { data, isLoading } = useTasks();
  if (isLoading) return <Loading />
  return (
    <div className='flex flex-row gap-3 bg-zinc-900 w-screen h-screen p-3'>
      <Table tasks={data?.tasks} />
      <div className='w-1/5 flex flex-col gap-2'>
        {data !== undefined && <CurrentTask currentTask={data.currentTask} />}
        <Filter />
      </div>
    </div>
  )
}


function ProjectCreate(props: {
  open: boolean,
  setOpen: React.Dispatch<SetStateAction<boolean>>,
  setProject: React.Dispatch<SetStateAction<number>>
  setTag: React.Dispatch<SetStateAction<string>>
}) {
  const [newProject, setNewProject] = useState("")
  const [newTag, setNewTag] = useState("")
  const { mutateAsync: createProject } = useCreateProject();
  const create = () => {
    console.log(newProject)
    if (newProject === "") return
    console.log(newProject)
    createProject({
      name: newProject,
      tag: newTag
    }).then(res => {
      props.setProject(res.id);
      props.setTag(res.tag)
      props.setOpen(false);
    })
  }
  const onClose = () => {
    props.setOpen(false);
  }
  return <Modal open={props.open} onClose={onClose}>
    <div
      className='flex flex-col absolute top-1/3 left-1/3 w-1/4 text-xl bg-zinc-900 border-2 shadow-gray-100 p-3 gap-5'
    >
      <div className='flex flex-col text-center text-xl text-gray-200 font-medium'>CREATE NEW PROJECT</div>
      <div className='flex flex-col gap-1'>
        <label className='text-gray-200 uppercase font-medium'>PROJECT NAME</label>
        <input className='bg-transparent max-h-8 border-gray-400 outline-none border-2 h-14 px-2 rounded-sm text-gray-200' placeholder='New Message' value={newProject} onChange={(e) => setNewProject(e.target.value)} />
      </div>
      <div className='flex flex-col gap-1'>
        <label className='text-gray-200 uppercase font-medium'>TAG</label>
        <select className='bg-zinc-900 max-h-8 border-gray-400 h-14 outline-none border-2 rounded-sm px-2 text-gray-200 ring-gray-800' name='Tag' value={newTag} onChange={(e) => setNewTag(e.currentTarget.value)}>
          <option className="pixel bg-transparent" value={"personal"}>PERSONAL</option>
          <option className="pixel bg-transparent" value={"work"}>WORK</option>
        </select>
      </div>
      <button className="bg-gray-200 p-2" onClick={() => create()}>CREATE</button>
    </div>
  </Modal>
}

function CurrentTask(props: { currentTask: IncompleteTask | null }) {
  const { mutate: complete, isLoading: isCompleteLoading } = useCompleteTask();
  const { mutate: create, isLoading: isCreateLoading } = useCreateTask();
  const [message, setMessage] = useState("");
  const [project, setProject] = useState(0);
  const [tag, setTag] = useState("personal");
  const { data: projects, isLoading: isProjectLoading } = useGetProjects();
  const [projectCreateModal, setProjectCreateModal] = useState(false);

  const createTask = () => {
    if (message === "") { return }
    const projectId = project !== -1 ? project : null
    console.log(project)
    if (projectId === undefined) return
    create({ message, tag, projectId });
    setMessage("");
    setTag("personal");
  }

  const changeProject = (project: number) => {
    console.log(project)
    setProject(project);
    const tag = projects?.projects.find(p => p.id == project)?.tag;
    if (tag !== undefined) setTag(tag)
  }
  return (
    <div className='w-full flex flex-col gap-3 border-zinc-500 border-2 p-3 rounded-sm text-lg h-1/3'>
      {props.currentTask === null && <div className='flex flex-col justify-around flex-grow'>
        <div className='border-2 border-gray-400 rounded-sm p-1 text-gray-200 thin'>
          <div className='text-center uppercase'>No Task Active</div>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-200 uppercase font-medium'>Description</label>
            <input className='bg-transparent min-w-0 max-h-8 border-gray-400 outline-none border-2 h-14 px-2 rounded-sm text-gray-200' placeholder='New Message' onChange={e => setMessage(e.currentTarget.value)} />
          </div>
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-200 uppercase font-medium'>PROJECT</label>
            <div className='flex flex-row gap-1'>
              <select className='bg-zinc-900 min-w-0 max-h-8 border-gray-400 flex-grow h-14 outline-none border-2 rounded-sm px-2 text-gray-200 ring-gray-800' name='Tag' onChange={(e) => changeProject(parseInt(e.currentTarget.value))} >
                {!isProjectLoading && projects?.projects.map(project => <option value={project.id}>{project.name}</option>)}
                <option value={-1}>None</option>
              </select>
              <button className="bg-gray-200 px-2" onClick={() => setProjectCreateModal(true)}>NEW</button>
            </div>
          </div>
          <div className='flex flex-col gap-1.5'>
            <label className='text-gray-200 uppercase font-medium'>TAG</label>
            <select disabled={project !== -1} className='bg-zinc-900 max-h-8 border-gray-400 h-14 outline-none border-2 rounded-sm px-2 text-gray-200 ring-gray-800' name='Tag' onChange={(e) => setTag(e.currentTarget.value)} value={tag}>
              <option className="pixel" value={"personal"}>PERSONAL</option>
              <option className="pixel" value={"work"}>WORK</option>
            </select>
          </div>
        </div>
        <ProjectCreate open={projectCreateModal} setOpen={setProjectCreateModal} setProject={setProject} setTag={setTag} />
        {
          !isCreateLoading &&
          <button
            className='border-2 rounded-sm p-2 px-5 bg-gray-300 border-gray-400 uppercase h-14'
            onClick={() => createTask()}
          >
            Create
          </button>
        }
      </div>}
      {
        props.currentTask !== null &&
        <div className='flex flex-col h-full justify-around text-lg gap-2'>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>Current Task</div><div className='flex-grow font-medium'>{`${props.currentTask.message}`}</div>
            </div>
          </div>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex  w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>Tag</div><div className='flex-grow font-medium uppercase'>{`${props.currentTask.tag}`}</div>
            </div>
          </div>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex  w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>PROJECT</div><div className='flex-grow font-medium uppercase'>{`${props.currentTask.projectId === null ? "NONE" : projects?.projects.find(p => props.currentTask?.projectId === p.id)?.name}`}</div>
            </div>
          </div>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex  w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>Started at </div><div className='flex-grow font-medium uppercase'>{dayjs(props.currentTask.startTime).format("hh:mm A")}</div>
            </div>
          </div>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex  w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>DATE</div><div className='flex-grow font-medium uppercase'>{dayjs(props.currentTask.date).format("DD MMMM YYYY")}</div>
            </div>
          </div>
          <div className='border-2 border-gray-400 rounded-sm text-gray-200 thin flex flex-col'>
            <div className='text-center flex  w-full'>
              <div className='uppercase text-gray-900 bg-gray-300 font-medium w-1/3'>TIME</div><div className='flex-grow font-medium uppercase'><ActiveTime startTime={props.currentTask.startTime} /></div>
            </div>
          </div>
          <button
            className='border-2 rounded-sm p-2 px-5 bg-gray-300 border-gray-500 uppercase hover:border-gray-900 hover:bg-gray-100 text-gray-800 font-bold hover:text-gray-900'
            onClick={() => complete()}
          >
            Complete
          </button>
          {isCompleteLoading && <div className='bg-gray-300'>
            <div className="animate-spin inline-block size-16 border-[3px] border-current border-t-transparent rounded-full text-gray-800" role="status" aria-label="loading">
              <span className="sr-only">Loading...</span>
            </div>
          </div>}
        </div>
      }
    </div >
  )
}

function Filter() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("ANY");
  const [year, setYear] = useState("ANY")
  console.log(day);
  return <div className='h-1/2 border-gray-100 border-2 rounded-sm text-gray-200 p-3 text-xl'>
    <div className='flex flex-col gap-2'>
      <div className='font-medium'>DATE FILTER</div>
      <div className='flex flex-col gap-3'>
        <div className='flex flex-row gap-2'>
          <label className=''>DAY</label>
          <input value={day} onChange={e => setDay(e.target.value)} placeholder='00' className='w-16 bg-transparent border border-gray-200 px-2 ring-gray-200' type='number' max={31} min={1} step={1} />
        </div>
        <div className='flex flex-row gap-2'>
          <label className=''>MONTH</label>
          <select className='bg-zinc-900 text-gray-200 border border-gray-200 px-2' onChange={(e) => setMonth(e.currentTarget.value)} value={month}>
            <option value={"ANY"}>ANY</option>
            <option value={"1"}>1</option>
            <option value={"2"}>2</option>
            <option value={"3"}>3</option>
            <option value={"4"}>4</option>
            <option value={"5"}>5</option>
            <option>6</option>
            <option>7</option>
            <option>8</option>
            <option>9</option>
            <option>10</option>
            <option>11</option>
            <option>12</option>
          </select>
        </div>
        <div className='flex flex-row gap-2'>
          <label className=''>YEAR</label>
          <input placeholder='0000' className='w-24 bg-transparent border border-gray-200 px-2 ring-gray-200' type='number' max={2024} min={2024} step={1}
            onChange={(e) => setYear(e.target.value)} value={year}
          />
        </div>
      </div>
    </div>
  </div>
}

function Table(props: { tasks: Array<Task> | undefined }) {
  const { data: projects } = useGetProjects();
  if (props.tasks === undefined) return <Loading />
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 15, align: "center", headerAlign: "center" },
    { field: "message", headerName: "DESCRIPTION", width: 250 },
    {
      field: "tag", headerName: "TAG", width: 100, align: "left", headerAlign: "left", renderCell(params) {
        return <div className='uppercase'>{params.value}</div>
      }
    },
    {
      field: "projectId", headerName: "PROJECT", width: 150, align: "left", headerAlign: "left",
      renderCell(params) {
        return <div className='uppercase'>
          {params.row.projectId === null ? "NONE" : projects?.projects.find(p => params.row.projectId === p.id)?.name}
        </div>
      }
    },
    {
      field: "date-date", headerName: "DAY", width: 30, align: "left", headerAlign: "left",
      renderCell(params) {
        return dayjs(params.row.date).format("DD");
      },
    },
    {
      field: "date-month", headerName: "MONTH", width: 70, align: "left", headerAlign: "left",
      renderCell(params) {
        return dayjs(params.row.date).format("MMMM");
      },
    },
    {
      field: "date-year", headerName: "YEAR", width: 75, align: "left", headerAlign: "left",
      renderCell(params) {
        return dayjs(params.row.date).format("YYYY");
      },
    },
    {
      field: "startTime", headerName: "START", width: 74, align: "center", headerAlign: "center", renderCell(params) {
        return dayjs(params.row.startTime).format("HH:mm");
      },
    },
    {
      field: "stopTime", headerName: "STOP", width: 74, align: "center", headerAlign: "center",
      renderCell(params) {
        return dayjs(params.row.stopTime).format("HH:mm");
      },
    },
    {
      field: "total", headerName: "TOTAL", align: "left", headerAlign: "left",
      renderCell(params) {
        return getTotal(params.row.total);
      },
    },
  ];
  return (
    <DataGrid rows={props.tasks} columns={columns}
      autoPageSize
      sx={{fontSize: "1.1rem"}}
      rowHeight={30}
      hideFooterPagination
      hideFooterSelectedRowCount
      hideFooter
    />
  )
}

function Loading() {
  return (
    <div className='fixed left-1/2 top-1/2'>
      <div className="animate-spin inline-block size-16 border-[3px] border-current border-t-transparent rounded-full text-blue-500" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

function ActiveTime(props: { startTime: Date }) {
  const [activeTime, setActiveTime] = useState<string>("00:00:00");
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTime(getTotalFromDate(props.startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTime]);
  return <>
    {activeTime}
  </>
}

function getTotalFromDate(startTime: Date) {
  return dayjs.duration(Math.abs(Date.now() - new Date(startTime.toString()).getTime())).format("HH:mm:ss");
}

function getTotal(min: number) {
  const hours = min / 60 < 10 ? `0${parseInt(`${min / 60}`)}` : `${parseInt(`${min / 60})`)}`
  const minu = min % 60 < 10 ? `0${parseInt(`${min % 60}`)}` : `${parseInt(`${min % 60})`)}`
  return hours + ":" + minu;
}

export default App
