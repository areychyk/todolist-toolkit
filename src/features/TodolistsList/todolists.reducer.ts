import {todolistsAPI, TodolistType} from 'api/todolists-api'

import {handleServerNetworkError} from 'utils/error-utils'
import {AppThunk} from 'app/store';
import {appActions, RequestStatusType} from "app/app.reducer";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {fetchTasksTC} from "features/TodolistsList/tasks.reducer";


const initialState: Array<TodolistDomainType> = []


const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)

        },
        addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            // return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
            const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'}
            state.unshift(newTodolist)

        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            // return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.title = action.payload.title
            }


        },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            // return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.filter = action.payload.filter
            }

        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            // return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.entityStatus = action.payload.entityStatus
            }

        },
        setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
            // return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
            return action.payload.todolists.map(tl => {
                return {...tl, filter: 'all', entityStatus: 'idle'}
            })

        },
        clearTodolistData:(state, action)=>{
            return state=[]
        }


    }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions


// thunks
export const fetchTodolistsTC = (): AppThunk => {
    return (dispatch) => {

        dispatch(appActions.setAppStatus({status: "loading"}))
        todolistsAPI.getTodolists()
            .then((res) => {
                // dispatch(setTodolistsAC(res.data))
                dispatch(todolistsActions.setTodolists({todolists: res.data}))
                dispatch(appActions.setAppStatus({status: "succeeded"}))
                return res.data
            })
            .then((todos) => {
                todos.forEach((tl) => {
                    dispatch(fetchTasksTC(tl.id))
                })
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}
export const removeTodolistTC = (todolistId: string): AppThunk => {
    return (dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appActions.setAppStatus({status: "loading"}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        // dispatch(changeTodolistEntityStatusAC(todolistId, 'loading'))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: todolistId, entityStatus: "loading"}))

        todolistsAPI.deleteTodolist(todolistId)
            .then((res) => {
                // dispatch(removeTodolistAC(todolistId))
                dispatch(todolistsActions.removeTodolist({id: todolistId}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appActions.setAppStatus({status: "succeeded"}))
            })
    }
}
export const addTodolistTC = (title: string): AppThunk => {
    return (dispatch) => {
        dispatch(appActions.setAppStatus({status: "loading"}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                // dispatch(addTodolistAC(res.data.data.item))
                dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
                dispatch(appActions.setAppStatus({status: "succeeded"}))
            })
    }
}
export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                // dispatch(changeTodolistTitleAC(id, title))
                dispatch(todolistsActions.changeTodolistTitle({id, title}))
            })
    }
}


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

