import { Dispatch } from 'redux';
import axios, { AxiosError } from 'axios';
import { appActions } from 'app/app.reducer';

/**
 * Обработчик ошибок, связанных с запросами к серверу.
 *
 * @param {unknown} e - Объект ошибки, тип которого неизвестен.
 * @param {Dispatch} dispatch - Функция, используемая для отправки действий в хранилище Redux.
 * @returns {void}
 */

export const handleServerNetworkError = (e: unknown, dispatch: Dispatch) => {
	const err = e as Error | AxiosError<{ error: string }>
	if (axios.isAxiosError(err)) {
		const error = err.message ? err.message : 'Some error occurred'
		dispatch(appActions.setAppError({error}))
	} else {
		dispatch(appActions.setAppError({error: `Native error ${err.message}`}))
	}
}
