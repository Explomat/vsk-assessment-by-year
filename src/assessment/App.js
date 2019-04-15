import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { Steps } from './steps';
import Profile from './profile';
import { Dimmer, Loader } from 'semantic-ui-react';

import { uiSteps } from './config/steps';
import { getStep } from './appActions';

class App extends Component {

	componentDidMount(){
		this.props.getStep();
	}

	render(){
		const { step, isLoading } = this.props;
		return isLoading ? (
			<Dimmer active inverted>
				<Loader inverted>Loading</Loader>
			</Dimmer>) : (
			<Router>
				<div className='app'>
					<Route exact path='/' render={() => {
						if (step === uiSteps.first){
							return <Steps />;
						} else if (step === uiSteps.second){
							return <Redirect to='/profile' />
						}
						return null;
					}} />
					<Route exact path='/profile' render={() => {
						if (step === uiSteps.second){
							return <Profile />;
						} else if (step === uiSteps.first){
							return <Redirect to='/' />
						}
						return null;
					}} />
					
				</div>
			</Router>
		)
	}
}

function mapStateToProps(state){
	return {
		step: state.app.step,
		isLoading: state.app.ui.isLoading
	}
}

export default withRouter(connect(mapStateToProps, { getStep })(App));
