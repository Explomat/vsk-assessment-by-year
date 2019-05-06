import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { Icon, Step, Segment, Button, Dimmer, Loader } from 'semantic-ui-react';
import Instruction from './Instruction';
import Status from './Status';
import SelectManager from './SelectManager';
import Confirm from './Confirm';
import { setStep, saveAssessment, loadInstruction } from './stepsActions';
import CSSModules from 'react-css-modules';

import styles from './index.css'

class Steps extends Component {

	_componentByStep(step){
		const { instruction } = this.props;

		switch (step) {
			case 0: 
				return <Instruction text={instruction}/>
			case 1:
				return <Status />
			case 2: 
				return <SelectManager />
			case 3: 
				return <Confirm />
			default: return null;
		}
	}

	_isStepCompleted(_step) {
		const { step } = this.props;
		return step > _step;
	}

	_isStepActive(_step) {
		const { step } = this.props;
		return step === _step;
	}

	_isStepDisabled(_step) {
		const { step } = this.props;
		return step < _step;
	}

	componentDidMount(){
		this.props.onLoad();
	}

	render() {
		const { ui, step, manager, status, nextStep, prevStep, save } = this.props;

		return (
			<div styleName='assessment-steps'>
				<Step.Group size='tiny' attached='top' fluid>
					<Step
						completed={this._isStepCompleted(0)}
						active={this._isStepActive(0)}
						disabled={this._isStepDisabled(0)}
					>
						<Icon name='file alternate outline' />
						<Step.Content>
							<Step.Title>Инструкция</Step.Title>
							<Step.Description>Ознакомьтесь с этапами прохождения оценки</Step.Description>
						</Step.Content>
					</Step>
					<Step
						completed={this._isStepCompleted(1)}
						active={this._isStepActive(1)}
						disabled={this._isStepDisabled(1)}
					>
						<Icon name='user' />
						<Step.Content>
							<Step.Title>Статус</Step.Title>
							<Step.Description>Вы руководитель или нет?</Step.Description>
						</Step.Content>
					</Step>

					<Step
						completed={this._isStepCompleted(2)}
						active={this._isStepActive(2)}
						disabled={this._isStepDisabled(2)}
					>
						<Icon name='users' />
						<Step.Content>
							<Step.Title>Руководитель</Step.Title>
							<Step.Description>Выберите своего руководителя</Step.Description>
						</Step.Content>
					</Step>

					<Step
						completed={this._isStepCompleted(3)}
						active={this._isStepActive(3)}
						disabled={this._isStepDisabled(3)}
					>
						<Icon name='info' />
						<Step.Content>
							<Step.Title>Подтверждение</Step.Title>
						</Step.Content>
					</Step>
				</Step.Group>
				<Segment attached styleName='assessment-steps__step'>
					{ui.isLoading && 
						<Dimmer active inverted>
				<Loader inverted>Loading</Loader>
			</Dimmer>
						}
					{this._componentByStep(step)}
				</Segment>
				<Segment attached>
					<Button
						disabled={step === 0}
						content='Назад'
						icon='left arrow'
						labelPosition='left'
						onClick={prevStep}
					/>
					<Button
						disabled={(step === 2 && manager.value === null) || (step === 1 && status === '')}
						color='green'
						floated='right'
						content={step === 3 ? 'Сохранить' : 'Вперед'}
						icon='right arrow'
						labelPosition='right'
						onClick={() => {
							step === 3 ? save() : nextStep()
						}}
					/>
				</Segment>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return state.app.steps;
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		dispatch,
		...ownProps
	}
}

const mergeProps = (stateProps, dispatchProps) => {
	const { step } = stateProps;
	const { dispatch } = dispatchProps;

	return {
		...stateProps,
		nextStep: () => dispatch(setStep(step + 1)),
		prevStep: () => dispatch(setStep(step - 1)),
		save: () => dispatch(saveAssessment(dispatchProps)),
		onLoad: () => dispatch(loadInstruction())
	}
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(CSSModules(Steps, styles)));