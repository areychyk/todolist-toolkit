import { AppDispatch, AppRootStateType } from 'app/store';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {ResponseType} from "common/types";
/**
 * Создает Async Thunk для приложения.
 *
 * @function
 * @template Returned, ThunkArg, ThunkAPI
 * @param {string} typePrefix - Префикс типа для действий Async Thunk.
 * @param {(payload: ThunkArg, api: ThunkAPI) => Promise<Returned>} payloadCreator - Функция-создатель payload для Async Thunk.
 * @returns {AsyncThunk<Returned, ThunkArg, { state: AppRootStateType, dispatch: AppDispatch, rejectValue: null | ResponseType }>} Async Thunk для приложения.
 */

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: AppRootStateType
	dispatch: AppDispatch
	rejectValue: null | ResponseType
}>()
