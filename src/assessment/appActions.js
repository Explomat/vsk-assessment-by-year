import createRemoteActions from '../utils/createRemoteActions';
import request from '../utils/request';
import { getStepMock } from './mock';

export const constants = {
	'INITIAL_LOADING': 'INITIAL_LOADING',
	...createRemoteActions('GET_STEP')
}

function loading(state){
	return {
		type: constants.INITIAL_LOADING,
		payload: state
	}
}

export function getStep(){
	return dispatch => {
		request('UiStep')
			.get()
			.then(d => {
				dispatch({
					type: constants.GET_STEP_SUCCESS,
					step: d.step
				});
				dispatch(loading(false));
			})
			.catch(e => console.log(e));

		/*setTimeout(() => {
			dispatch({
				type: constants.GET_STEP_SUCCESS,
				step: getStepMock()
			});

			dispatch(loading(false));
		}, 1000)*/
	}
}