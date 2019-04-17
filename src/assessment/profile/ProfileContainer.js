import Profile from './Profile';
import PaContainer from './PaContainer';
import { setNewManager, secondStep, fourthStep} from './profileActions';
import { omit } from 'lodash';
import { connect } from 'react-redux';

function mapStateToProps(state){
	const { profile } = state.app;
	const result = omit(profile, 'result');
	return {
		PaContainer,
		meta: profile.result.meta,
		user: profile.result.user,
		instruction: profile.result.instruction,
		legends: profile.result.rules.map(r => profile.rules[r]),
		...result
	}
}

function mapDispatchProps(dispatch, ownProps) {
	return {
		onChangeManager: () => dispatch(setNewManager()),
		onSecondStep: () => dispatch(secondStep()),
		onFourthStep: (isAgree) => dispatch(fourthStep(isAgree))
	}
}

/*const wrapHOC = (WrappedComponent) => (props) => (
	<WrappedComponent {...props} CompetenceComponent={CompetenceContainer}/>
);*/

export default connect(mapStateToProps, mapDispatchProps)(Profile);