import { useState } from 'react';
import { IncompleteTask, Task } from './api/task';
import { useCompleteTask, useCreateTask, useTasks } from './query/useTask'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

function App() {
  const { data, isLoading } = useTasks();
  return (
    <div className='flex flex-col gap-3 bg-zinc-900 w-screen h-screen p-3'>
      {isLoading && <div>loading</div>}
      {data !== undefined && <CurrentTask currentTask={data?.currentTask} />}
      <Table tasks={data?.tasks} />
    </div>
  )
}

function CurrentTask(props: { currentTask: IncompleteTask | null }) {
  const { mutate: complete, isLoading: isCompleteLoading } = useCompleteTask();
  const { mutate: create, isLoading: isCreateLoading } = useCreateTask();
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState("personal");

  const createTask = () => {
    if (message === "") { return }
    create({ message, tag });
    setMessage("");
    setTag("personal");
  }
  return (
    <div className='w-full h-14 flex flex-row gap-2'>
      <div className='border rounded-sm flex-grow p-3.5 text-gray-300'>
        {props.currentTask === null && <div className='text-center'>No Task Active</div>}
        {props.currentTask !== null && <div>
          Current Task : {`${props.currentTask.message}`}
        </div>}
      </div>
      {props.currentTask !== null && <div className='border rounded-sm p-3.5 text-gray-300'>
        Started at {getTime(props.currentTask.startTime.toString())}
      </div>}
      {props.currentTask === null && <input className='bg-transparent outline-none border rounded-sm px-5 text-gray-300' placeholder='New Message' onChange={e => setMessage(e.currentTarget.value)} />}
      {props.currentTask === null && <select className='bg-zinc-900 outline-none border rounded-sm px-5 text-gray-300 ring-gray-800' name='Tag' onChange={(e) => setTag(e.currentTarget.value)}>
        <option value="personal">PERSONAL</option>
        <option value="work">WORK</option>
      </select>}
      {props.currentTask === null && !isCreateLoading &&
        <button
          className='border rounded-sm p-2 px-5 bg-gray-300 uppercase'
          onClick={() => createTask()}
        >
          Create
        </button>
      }
      {props.currentTask !== null && !isCompleteLoading &&
        <button
          className='border rounded-sm p-2 px-5 bg-gray-300 uppercase'
          onClick={() => complete()}
        >
          Complete
        </button>
      }
      {isCompleteLoading && <div className='bg-gray-300'>
        <div className="animate-spin inline-block size-16 border-[3px] border-current border-t-transparent rounded-full text-gray-800" role="status" aria-label="loading">
          <span className="sr-only">Loading...</span>
        </div>
      </div>}
    </div>
  )
}

function Table(props: { tasks: Array<Task> | undefined }) {
  if (props.tasks === undefined) return <Loading />
  const columns: GridColDef[] = [
    { field: "id", headerName: "Id", width: 40 },
    { field: "message", headerName: "Messsage", width: 300 },
    { field: "tag", headerName: "Tag" },
    {
      field: "date", headerName: "Date", renderCell(params) {
        return getDate(params.row.date.toString());
      },
    },
    {
      field: "startTime", headerName: "Start Time", renderCell(params) {
        return getTime(params.row.startTime.toString());
      },
    },
    {
      field: "stopTime", headerName: "Stop Time", renderCell(params) {
        return getTime(params.row.stopTime.toString());
      },
    },
    {
      field: "total", headerName: "Total", renderCell(params) {
        return getTotal(params.row.total);
      },
    },
  ];
  return (
    <DataGrid rows={props.tasks} columns={columns} autoPageSize />
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

function getTime(time: string) {
  return time.split("T")[1].split(".")[0];
}

function getDate(date: string) {
  return date.split("T")[0];
}

function getTotal(min: number) {
  console.log(min);
  const hours = min / 60 < 10 ? `0${parseInt(`${min / 60}`)}` : `${parseInt(`${min / 60})`)}`
  const minu = min % 60 < 10 ? `0${parseInt(`${min % 60}`)}` : `${parseInt(`${min % 60})`)}`
  return hours + ":" + minu;
}

export default App
