import createRemoteActions from '../../utils/createRemoteActions';
import request from '../../utils/request';
import { getStep } from '../appActions';
import { searchManagersMock, saveAssessmentMock } from '../mock';

export const constants = {
	...createRemoteActions([
		'STEPS_GET_COLLABORATORS',
		'STEPS_SAVE'
	]),
	'STEPS_SET_STEP': 'STEPS_SET_STEP',
	'STEPS_SET_LOADING': 'STEPS_SET_LOADING',
	'STEPS_SET_MANAGER': 'STEPS_SET_MANAGER',
	'STEPS_SET_STATUS': 'STEPS_SET_STATUS',
	'STEPS_SET_REDIRECT': 'STEPS_SET_REDIRECT'
};

export function setStep(step){
	return {
		type: constants.STEPS_SET_STEP,
		payload: step
	}
};

export function setStatus(status){
	return {
		type: constants.STEPS_SET_STATUS,
		payload: status
	}
};

export function setManager(result){
	return {
		type: constants.STEPS_SET_MANAGER,
		payload: result
	}
};

function setLoading(isLoading){
	return {
		type: constants.STEPS_SET_LOADING,
		payload: isLoading
	}
};

export function saveAssessment(ownProps){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		const { app } = getState();
		request('CreateInitialProfile')
			.post({
				status: app.steps.status,
				manager: app.steps.manager.value
			})
			.then(d => {
				dispatch(getStep());
				dispatch(setLoading(false));
				ownProps.history.push('/profile');
			});

		/*setTimeout(() => {
			saveAssessmentMock({
				status: app.steps.status,
				manager: app.steps.manager.value
			});
			dispatch(getStep());
			dispatch(setLoading(false));
			ownProps.history.push('/profile');
		}, 1000);*/
	}
};

export function searchManagers(value){
	return dispatch => {

		request('Collaborators')
			.get({ search: value })
			.then(d => {
				dispatch({
					type: constants.STEPS_GET_COLLABORATORS_SUCCESS,
					payload: d
				});
			})
			.catch(e => console.log(e));

		/*setTimeout(() => {
			dispatch({
					type: constants.STEPS_GET_COLLABORATORS_SUCCESS,
					payload: searchManagersMock(value)
				});
		}, 300);*/
	}
};
