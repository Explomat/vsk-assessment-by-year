import { constants } from './profileActions';

const uiReducer = (state = {}, action) => {
	switch(action.type){
		case constants.PROFILE_SET_TAB: {
			return {
				...state,
				activeTab: action.payload
			}
		}

		case constants.PROFILE_SET_LOADING: {
			return {
				...state,
				isLoading: action.payload
			}
		}

		case constants.PROFILE_SEARCH_SUBORDINATES: {
			return {
				...state,
				searchSubodinatesValue: action.payload
			}
		}

		case constants.PROFILE_TOGGLE_PA: {
			const newState = {
				...state,
				pas: {
					...state.pas,
					[action.payload]: !state.pas[action.payload]
				}
			}

			return newState;
		}

		default: return state;
	}
}

const pasReducer = (state = {}, action) => {
	switch(action.type){
		case constants.PROFILE_UPDATE_PA: {
			return {
				...state,
				[action.payload.paId]: {
					...state[action.payload.paId],
					overall: action.payload.paOverall
				}
			}
		}

		default: return state;
	}
}

const competencesReducer = (state = {}, action) => {
	switch(action.type){
		case constants.PROFILE_UPDATE_PA: {
			return {
				...state,
				[action.payload.competenceId]: {
					...state[action.payload.competenceId],
					mark_text: action.payload.competenceMarkText,
					mark_value: action.payload.competenceMarkValue
				}
			}
		}

		default: return state;
	}
}

const indicatorsReducer = (state = {}, action) => {
	switch(action.type){
		case constants.PROFILE_SET_MARK: {
			return {
				...state,
				[action.payload.indicatorId]: {
					...state[action.payload.indicatorId],
					mark_text: action.payload.markText,
					mark_value: action.payload.markValue
				}
			}
		}

		case constants.PROFILE_SET_COMMENT: {
			return {
				...state,
				[action.payload.indicatorId]: {
					...state[action.payload.indicatorId],
					comment: action.payload.comment
				}
			}
		}

		default: return state;
	}
}

const profileReducer = (state = {
	commonIndicators: {},
	commonCompetences: {},
	rules: {},
	indicators: {},
	competences: {},
	subordinates: {},
	pas: {},
	result: {
		user: {
			subordinates: [],
			assessment: {
				pas: []
			}
		},
		rules: [],
		commonCompetences: []
	},
	ui: {
		isLoading: true,
		activeTab: 'profile',
		searchSubodinatesValue: '',
		pas: {}
	}
}, action) => {
	switch(action.type){
		case constants.PROFILE_GET_INITIAL_DATA_SUCCESS: {
			const newState = {
				...state,
				...action.payload
			}
			return newState;
		}

		case constants.PROFILE_TOGGLE_PA:
		case constants.PROFILE_SET_LOADING:
		case constants.PROFILE_SEARCH_SUBORDINATES:
		case constants.PROFILE_SET_TAB: {
			return {
				...state,
				ui: uiReducer(state.ui, action)
			}
		}

		case constants.PROFILE_UPDATE_PA:
		case constants.PROFILE_SET_COMMENT:
		case constants.PROFILE_SET_MARK: {
			return {
				...state,
				indicators: indicatorsReducer(state.indicators, action),
				competences: competencesReducer(state.competences, action),
				pas: pasReducer(state.pas, action)
			}
		}

		default: return state;
	}
}

export default profileReducer;