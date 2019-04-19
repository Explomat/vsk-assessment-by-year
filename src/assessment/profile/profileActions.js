import createRemoteActions from '../../utils/createRemoteActions';
import { constants as appConstants } from '../appActions';
import request from '../../utils/request';
import mock from './mockData';
import { setStepMock } from '../mock';
import { normalize, denormalize, schema } from 'normalizr';
import { find } from 'lodash';
import {
	computeCompetencePercent,
	computeResultPercents,
	computeScaleByPercent
} from '../calculations';


const rule = new schema.Entity('rules', {}, { idAttribute: 'scale' });
const commonIndicator = new schema.Entity('commonIndicators');
const commonCompetence = new schema.Entity('commonCompetences', {
	commonIndicators: [ commonIndicator ]
});
const indicator = new schema.Entity('indicators', {}, { idAttribute: (value, parent, key) => {
	return `${value.pa_id}_${parent.competence_id}_${value.indicator_id}`
}});
const competence = new schema.Entity('competences', {
	indicators: [ indicator ]
}, { idAttribute: (value, parent, key) => {
	return `${parent.id}_${value.competence_id}`
}});

const pa = new schema.Entity('pas', {
	competences: [ competence ]
});

const app = new schema.Object({
	commonCompetences: [ commonCompetence ],
	rules: [ rule ],
	user: new schema.Object({
		assessment: new schema.Object({
			pas: [ pa ]
		})
	})
});

export const constants = {
	...createRemoteActions([
		'PROFILE_GET_INITIAL_DATA',
		'PROFILE_SECOND_STEP',
		'PROFILE_FOURTH_STEP'
	]),
	'PROFILE_SET_TAB': 'PROFILE_SET_TAB',
	'PROFILE_SET_LOADING': 'PROFILE_SET_LOADING',
	'PROFILE_SET_MARK': 'PROFILE_SET_MARK',
	'PROFILE_UPDATE_PA': 'PROFILE_UPDATE_PA',
	'PROFILE_SET_COMMENT': 'PROFILE_SET_COMMENT',
	'PROFILE_SEARCH_SUBORDINATES': 'PROFILE_SEARCH_SUBORDINATES',
	'PROFILE_TOGGLE_PA': 'PROFILE_TOGGLE_PA'
}

export function togglePa(paId){
	return {
		type: constants.PROFILE_TOGGLE_PA,
		payload: paId
	}
}

export function searchSubordinates(val){
	return {
		type: constants.PROFILE_SEARCH_SUBORDINATES,
		payload: val
	}
}

export function setNewManager(){
	return dispatch => {
		dispatch(setLoading(true));

		request('ResetManager')
			.post({})
			.then(data => {
				dispatch(setLoading(false));
				dispatch({
					type: appConstants.GET_STEP_SUCCESS,
					step: 'first'
				});
			})
			.catch(e => console.log(e));
		/*setTimeout(() => {
			setStepMock('first');
			dispatch({
				type: appConstants.GET_STEP_SUCCESS,
				step: 'first'
			});
		}, 500);*/
	}
}

export function setComment(indicatorId, comment){
	return {
		type: constants.PROFILE_SET_COMMENT,
		payload: {
			indicatorId,
			comment
		}
	}
}

export function setTab(tabName){
	return {
		type: constants.PROFILE_SET_TAB,
		payload:tabName
	}
}

export function getInitialData(){
	return dispatch => {
		/*request('ProfileData')
			.get()
			.then(r => r.json())
			.then(d => {
				const ndata = normalize(d, app);
				dispatch({
					type: constants.PROFILE_GET_INITIAL_DATA_SUCCESS,
					payload: {
						...ndata.entities,
						result: ndata.result
					}
				});
				dispatch(setLoading(false));
			})
			.catch(e => console.log(e));*/
		setTimeout(() => {
			const ndata = normalize(mock, app);
			console.log(JSON.stringify(ndata));
			dispatch({
				type: constants.PROFILE_GET_INITIAL_DATA_SUCCESS,
				payload: {
					...ndata.entities,
					result: ndata.result
				}
			});
			dispatch(setLoading(false));
		}, 500);
	}
}

function setMark(indicatorId, markText, markValue){
	return {
		type: constants.PROFILE_SET_MARK,
		payload: {
			indicatorId,
			markText,
			markValue
		}
	}
}

export function updatePa(paId, competenceId, indicatorId, markText, markValue) {
	return (dispatch, getState) => {
		dispatch(setMark(indicatorId, markText, markValue));

		const { app } = getState();
		const competencePercent = computeCompetencePercent(competenceId, app.profile);
		const competenceScale = computeScaleByPercent(competencePercent, app.profile);
		const paOverall = computeResultPercents(paId, app.profile);

		dispatch({
			type: constants.PROFILE_UPDATE_PA,
			payload: {
				paId,
				competenceId,
				competenceMarkText: competenceScale,
				competenceMarkValue: competencePercent,
				paOverall
			}
		});
	}
}

export function secondStep(){
	return (dispatch, getState) => {
		dispatch(setLoading(true));

		const { app } = getState();
		const { competences, indicators, pas } = app.profile;
		const { user } = app.profile.result;

		/*const indicator = new schema.Entity('indicators', {}, { idAttribute: 'indicator_id'});
		const competence = new schema.Entity('competences', {
			indicators: [ indicator ]
		}, { idAttribute: 'competence_id'});
		const pa = new schema.Entity('pas', {
			competences: [ competence ]
		});

		const entities = {
			pas
		};
		const denormalizedData = denormalize({pas: Object.keys(pas)}, competence, entities);*/

		const pa = find(user.assessment.pas.map(p => pas[p]), { status: 'self' });
		if (pa !== undefined){
			const comps = pa.competences.map(c => {
				const comp = competences[c];
				return {
					...comp,
					indicators: comp.indicators.map(i => indicators[i])
				}
			});

			const data = {
				id: pa.id,
				overall: pa.overall,
				competences: comps
			}

			dispatch(setLoading(true));
			request('SecondStep')
				.post(data)
				.then(d => {
					dispatch(getInitialData());
					dispatch(setLoading(false));
				})
				.catch(e => console.log(e))
		}

		/*setTimeout(()=> {
			dispatch(setLoading(false));
			dispatch({
				type: constants.PROFILE_SECOND_STEP,
				payload: data.step
			});
		}, 500);*/
	}
}

export function fourthStep(isAgree){
	return dispatch => {
		request('FourthStep')
			.post({
				answer: isAgree
			})
			.then(d => {
				dispatch(getInitialData());
				dispatch(setLoading(false));
			})
			.catch(e => console.log(e))
	}
}


function setLoading(isLoading){
	return {
		type: constants.PROFILE_SET_LOADING,
		payload: isLoading
	}
}