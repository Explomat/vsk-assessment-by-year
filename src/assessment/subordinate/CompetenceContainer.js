import Competence from '../profile/Competence';
//import { assessmentSteps } from '../config/steps';
import { setMark, setComment } from './subordinateActions';
import { omit } from 'lodash';
import { connect } from 'react-redux';

function mapStateToProps(state){
	const { subordinate } = state.app;
	const result = omit(subordinate, 'result');
	//const isDisabled = subordinate.result.user.assessment.step != assessmentSteps.second;
	return {
		//isDisabled,
		legends: subordinate.result.rules.map(r => subordinate.rules[r]),
		...result
	}
}

function mapDispatchProps(dispatch) {
	return {
		changeMark: (indicatorId, markText, markValue) => {
			dispatch(setMark(indicatorId, markText, markValue));
		},
		changeComment: (indicatorId, value) => dispatch(setComment(indicatorId, value))
	}
}

export default connect(mapStateToProps, mapDispatchProps)(Competence);