import Competence from '../profile/Competence';
//import { assessmentSteps } from '../config/steps';
import { updatePa, setComment } from './subordinateActions';
import { omit } from 'lodash';
import { connect } from 'react-redux';

function mapStateToProps(state, ownProps){
	const { subordinate } = state.app;
	const result = omit(subordinate, 'result');
	return {
		legends: subordinate.result.rules.map(r => subordinate.rules[r]),
		paId: ownProps.paId,
		...result
	}
}

function mapDispatchProps(dispatch) {
	return {
		onUpdatePa: (paId, competenceId, indicatorId, markText, markValue) => {
			dispatch(updatePa(paId, competenceId, indicatorId, markText, markValue));
		},
		changeComment: (indicatorId, value) => dispatch(setComment(indicatorId, value))
	}
}

export default connect(mapStateToProps, mapDispatchProps)(Competence);