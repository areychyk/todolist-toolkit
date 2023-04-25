import { AppDispatch, AppRootStateType } from 'app/store';
import { handleServerNetworkError } from 'common/utils/handle-server-network-error';
import {BaseThunkAPI} from "@reduxjs/toolkit/dist/createAsyncThunk";
import {appActions} from "app/app.reducer";
import {ResponseType} from "common/types";


/**
 * Обертка над логикой Async Thunk, обрабатывающая ошибки.
 *
 * @async
 * @function
 * @param {BaseThunkAPI<AppRootStateType, any, AppDispatch, null | ResponseType>} thunkAPI - API для создания Async Thunk.
 * @param {Function} logic - Функция с логикой Async Thunk.
 * @returns {Promise<unknown>} Результат выполнения логики Async Thunk.
 */

export const thunkTryCatch = async (thunkAPI: BaseThunkAPI<AppRootStateType, any, AppDispatch, null | ResponseType>, logic: Function) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        return await logic()
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)

    } finally {
        dispatch(appActions.setAppStatus({status: 'idle'}))
    }
}
