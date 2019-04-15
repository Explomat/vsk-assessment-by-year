import { constants } from './subordinateActions';

const uiReducer = (state = {}, action) => {
	switch(action.type){
		case constants.SUBORDINATE_SET_LOADING: {
			return {
				...state,
				isLoading: action.payload
			}
		}

		case constants.SUBORDINATE_TOGGLE_PA: {
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

const indicatorsReducer = (state = {}, action) => {
	switch(action.type){
		case constants.SUBORDINATE_SET_MARK: {
			return {
				...state,
				[action.payload.indicatorId]: {
					...state[action.payload.indicatorId],
					mark_text: action.payload.markText
				}
			}
		}

		case constants.SUBORDINATE_SET_COMMENT: {
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

const subordinateReducer = (state = {
	commonIndicators: {},
	commonCompetences: {},
	rules: {},
	indicators: {},
	competences: {},
	pas: {},
	result: {
		user: {
			subordinates: []
		},
		rules: [],
		commonCompetences: []
	},
	ui: {
		isLoading: true,
		pas: {}
	}
}, action) => {
	switch(action.type){
		case constants.SUBORDINATE_GET_INITIAL_DATA_SUCCESS: {
			const newState = {
				...state,
				...action.payload
			}
			return newState;
		}

		case constants.SUBORDINATE_TOGGLE_PA:
		case constants.SUBORDINATE_SET_LOADING:{
			return {
				...state,
				ui: uiReducer(state.ui, action)
			}
		}

		case constants.SUBORDINATE_SET_COMMENT:
		case constants.SUBORDINATE_SET_MARK: {
			return {
				...state,
				indicators: indicatorsReducer(state.indicators, action)
			}
		}

		default: return state;
	}
}

export default subordinateReducer;