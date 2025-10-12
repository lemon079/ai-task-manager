import React from 'react'
import { DataTable } from '../ui/data-table'
import { columns } from './columns'
import { Task } from '@prisma/client';

const TaskTable = ({ tasks, isDashboard }: { tasks: Task[], isDashboard?: boolean }) => {
    return (
        <div className='mt-4 bg-white rounded-md'>
            <DataTable columns={columns} data={tasks} isDashboard={isDashboard}/>
        </div>
    )
}

export default TaskTable