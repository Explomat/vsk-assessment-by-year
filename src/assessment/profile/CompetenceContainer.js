import Competence from './Competence';
import { assessmentSteps } from '../config/steps';
import { setMark, setComment } from './profileActions';
import { omit } from 'lodash';
import { isCommentRequire } from '../calculations';
import { connect } from 'react-redux';

function mapStateToProps(state){
	const { profile } = state.app;
	const result = omit(profile, 'result');
	const isDisabled = profile.result.user.assessment.step > assessmentSteps.first;
	return {
		legends: profile.result.rules.map(r => profile.rules[r]),
		isDisabled,
		...result
	}
}

function mapDispatchProps(dispatch) {
	return {
		changeMark: (indicatorId, markText, scales) => {
			/*if (!isCommentRequire(scales, markText)) {
				dispatch(setComment(indicatorId, ''));
			}*/
			dispatch(setMark(indicatorId, markText));
		},
		changeComment: (indicatorId, value) => dispatch(setComment(indicatorId, value))
	}
}

export default connect(mapStateToProps, mapDispatchProps)(Competence);