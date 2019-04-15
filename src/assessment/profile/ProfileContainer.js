import React from 'react';
import Profile from './Profile';
import CompetenceContainer from './CompetenceContainer';
import { setNewManager, togglePa, secondStep, fourthStep} from './profileActions';
import { omit } from 'lodash';
import { connect } from 'react-redux';

function mapStateToProps(state){
	const { profile } = state.app;
	const result = omit(profile, 'result');
	return {
		meta: profile.result.meta,
		user: profile.result.user,
		legends: profile.result.rules.map(r => profile.rules[r]),
		...result
	}
}

function mapDispatchProps(dispatch, ownProps) {
	return {
		onChangeManager: () => dispatch(setNewManager()),
		onTogglePa: (paId) => dispatch(togglePa(paId)),
		onSecondStep: () => dispatch(secondStep()),
		onFourthStep: (isAgree) => dispatch(fourthStep(isAgree))
	}
}

const wrapHOC = (WrappedComponent) => (props) => (
	<WrappedComponent {...props} CompetenceComponent={CompetenceContainer}/>
);

export default connect(mapStateToProps, mapDispatchProps)(wrapHOC(Profile));