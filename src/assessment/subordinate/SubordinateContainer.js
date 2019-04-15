import React from 'react';
import Profile from '../profile/Profile';
import CompetenceContainer from './CompetenceContainer';
import { togglePa} from './subordinateActions';
import { omit } from 'lodash';
import { connect } from 'react-redux';

function mapStateToProps(state){
	const { subordinate } = state.app;
	const result = omit(subordinate, 'result');
	return {
		meta: subordinate.result.meta,
		user: subordinate.result.user,
		legends: subordinate.result.rules.map(r => subordinate.rules[r]),
		...result
	}
}

function mapDispatchProps(dispatch, ownProps) {
	return {
		onTogglePa: (paId) => dispatch(togglePa(paId))
	}
}

const wrapHOC = (WrappedComponent) => (props) => (
	<WrappedComponent {...props} CompetenceComponent={CompetenceContainer}/>
);

export default connect(mapStateToProps, mapDispatchProps)(wrapHOC(Profile));