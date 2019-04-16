import React, { Component } from 'react';
import { assessmentSteps } from '../config/steps';
import ProfileContainer from './ProfileContainer';
import ViewSubordinate from '../subordinate';
import Subordinate from './Subordinate';
import { withRouter } from 'react-router';
import { Menu, Segment, Input, List, Dimmer, Loader, Modal, Header, Button, Icon, Message } from 'semantic-ui-react';
import { setTab, searchSubordinates, getInitialData } from './profileActions';
import { connect } from 'react-redux';
import { find } from 'lodash';

class Main extends Component {

	constructor(props){
		super(props);
		this.state = {
			isShowSubordinate: false,
			isManagerCanNotEstimate: false,
			curSubordinate: {}
		}
		this.onShowSubordinate = this.onShowSubordinate.bind(this);
		this.onShowMessage = this.onShowMessage.bind(this);
	}

	componentDidMount(){
		this.props.loadData();
	}

	onShowMessage(){
		this.setState({
			isManagerCanNotEstimate: !this.state.isManagerCanNotEstimate
		});
	}

	onShowSubordinate(subordinateId){
		const { subordinates } = this.props;
		const subordinate = find(subordinates, { id: subordinateId });
		if (subordinate){
			if (subordinate.assessment.step === assessmentSteps.first){
				return this.setState({
					isManagerCanNotEstimate: true,
					curSubordinate: subordinate
				});
			}
		}

		this.setState({
			isShowSubordinate: !this.state.isShowSubordinate,
			subordinateId
		});
	}

	render(){
		const { ui, user, subordinates,  onChangeTab, onSearchSubordinates } = this.props;
		const { isShowSubordinate, isManagerCanNotEstimate, curSubordinate, subordinateId } = this.state;

		if (ui.isLoading) {
			return (
				<Dimmer active inverted>
					<Loader inverted>Loading</Loader>
				</Dimmer>
			)
		}
		return(
			<div className='assessment-profile'>
				<Menu attached='top' tabular>
					<Menu.Item
						name='profile'
						active={ui.activeTab === 'profile'}
						onClick={onChangeTab}
					>
						Моя анкета
					</Menu.Item>

					{user.isManager && <Menu.Item
						name='subordinates'
						active={ui.activeTab === 'subordinates'}
						onClick={onChangeTab}
					>
						Анкеты подчиненных
					</Menu.Item>}
					{user.isManager
						&& ui.activeTab === 'subordinates'
						&& (<Menu.Menu position='right'>
						<Menu.Item disabled>
							<Input
								transparent
								icon={{ name: 'search', link: true }}
								placeholder='Поиск...'
								onChange={onSearchSubordinates}
								value={ui.searchSubodinatesValue}
							/>
						</Menu.Item>
					</Menu.Menu>)}
				</Menu>

				<Segment attached='bottom'>
					{
						ui.activeTab === 'profile' ? (
							<ProfileContainer />
						) : (
							subordinates.length > 0 ? (<List verticalAlign='middle' selection>
								{
									subordinates.map(s => (
										<Subordinate
											key={s.id}
											subordinate={s}
											onClick={this.onShowSubordinate}
										/>
									))
								}
							</List>) : (
								<Message info>
									<Message.Content>У вас еще нет подчиненных</Message.Content>
								</Message>
							)
						) 
					}
				</Segment>
				{isShowSubordinate && (
					<ViewSubordinate
						onClose={this.onShowSubordinate}
						subordinateId={subordinateId}
					/>)
				}
				{isManagerCanNotEstimate && (
					<Modal open basic size='small'>
						<Header icon='user' content={curSubordinate.fullname} />
						<Modal.Content>
							<p>{`Вы не можете сейчас оценвать сотрудника, т.к. он находится на этапе "${curSubordinate.assessment.stepName}"`}</p>
						</Modal.Content>
						<Modal.Actions>
							<Button color='blue' inverted onClick={this.onShowMessage}>
								<Icon name='checkmark' /> Ok
							</Button>
						</Modal.Actions>
					</Modal>
				)}
			</div>
		);
	}
}


function mapStateToProps(state){
	const { profile } = state.app;
	return {
		user: profile.result.user,
		ui: profile.ui,
		subordinates: profile.result.user.subordinates.filter(s => {
			const w = s.fullname.toLowerCase();
			const ss = profile.ui.searchSubodinatesValue.toLowerCase();
			return ~w.indexOf(ss);
		})
	}
}

function mapDispatchProps(dispatch, ownProps) {
	return {
		onChangeTab: (e, data) => dispatch(setTab(data.name)),
		onSearchSubordinates: (e, { value }) => dispatch(searchSubordinates(value)),
		loadData: () => dispatch(getInitialData())
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchProps)(Main));
export { default as profileReducer } from './profileReducer';