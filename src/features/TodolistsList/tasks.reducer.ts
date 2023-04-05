import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from 'api/todolists-api'
import {AppThunk} from 'app/store'
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils'
import {appActions} from "app/app.reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {todolistsActions} from "features/TodolistsList/todolists.reducer";

const initialState: TasksStateType = {}


const slice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        removeTask: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
           const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index !== -1) tasks.splice(index, 1)

        },
        addTask: (state, action: PayloadAction<{ task: TaskType }>) => {
            const tasks = state[action.payload.task.todoListId]
            tasks.unshift(action.payload.task)
        },
        updateTask: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {


            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(t => t.id === action.payload.taskId)
            if (index !== -1) {
                tasks[index]={...tasks[index], ...action.payload.model}
            }
        },
        setTasks: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
//             return {...state, [action.todolistId]: action.tasks}
            state[action.payload.todolistId]=action.payload.tasks
        },
    },
    extraReducers: builder => {
        builder
            .addCase(todolistsActions.addTodolist, (state, action) => {
                 state[action.payload.todolist.id]=[]
            })
            .addCase(todolistsActions.removeTodolist,(state, action)=>{
               delete state[action.payload.id]
            })
            .addCase(todolistsActions.setTodolists, (state, action)=>{
                action.payload.todolists.forEach(tl=>{
                    state[tl.id]=[]
                })
            })
            .addCase(todolistsActions.clearTodolistData, (state, action)=>{
                return state={}
            })
    }
})

export const tasksReducer = slice.reducer
export const tasksActions = slice.actions

// export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
//     switch (action.type) {
//         case 'REMOVE-TASK':
//             return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
//         case 'ADD-TASK':
//             return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
//         case 'UPDATE-TASK':
//             return {
//                 ...state,
//                 [action.todolistId]: state[action.todolistId]
//                     .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
//             }

//         case 'ADD-TODOLIST':
//             return {...state, [action.todolist.id]: []}
//         case 'REMOVE-TODOLIST':
//             const copyState = {...state}
//             delete copyState[action.id]
//             return copyState
//         case 'SET-TODOLISTS': {
//             const copyState = {...state}
//             action.todolists.forEach(tl => {
//                 copyState[tl.id] = []
//             })
//             return copyState
//         }
//         case 'SET-TASKS':
//             return {...state, [action.todolistId]: action.tasks}
//         default:
//             return state
//     }
// }

// actions
// export const removeTaskAC = (taskId: string, todolistId: string) =>
//     ({type: 'REMOVE-TASK', taskId, todolistId} as const)
// export const addTaskAC = (task: TaskType) =>
//     ({type: 'ADD-TASK', task} as const)
// export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
//     ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
// export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
//     ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string): AppThunk => (dispatch) => {

    dispatch(appActions.setAppStatus({status: "loading"}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            // dispatch(setTasksAC(tasks, todolistId))
            dispatch(tasksActions.setTasks({tasks,todolistId:todolistId}))
            dispatch(appActions.setAppStatus({status: "succeeded"}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string):AppThunk => (dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            // const action = removeTaskAC(taskId, todolistId)
            dispatch(tasksActions.removeTask({taskId,todolistId:todolistId}))
        })
}
export const addTaskTC = (title: string, todolistId: string): AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({status: "loading"}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                // const action = addTaskAC(task)
                dispatch(tasksActions.addTask({task}))
                dispatch(appActions.setAppStatus({status: "succeeded"}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
    (dispatch, getState) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    // const action = updateTaskAC(taskId, domainModel, todolistId)
                    dispatch(tasksActions.updateTask({taskId,todolistId:todolistId,model:domainModel}))
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
// type ActionsType =
//     | ReturnType<typeof removeTaskAC>
//     | ReturnType<typeof addTaskAC>
//     | ReturnType<typeof updateTaskAC>
//     | AddTodolistActionType
//     | RemoveTodolistActionType
//     | SetTodolistsActionType
//     | ReturnType<typeof setTasksAC>

