import React from 'react';
//import { assessmentSteps } from '../config/steps';  
import { Popup, Label, List, Image, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { computeScaleByPercent } from '../calculations';

const Subordinate = ({ subordinate, rules, onClick }) => {
	const overallMark = computeScaleByPercent(subordinate.assessment.overall, { rules });
	return (
		<List.Item key={subordinate.id} className='assessment-profile-subordinate' onClick={() => onClick(subordinate.id)}>
			{overallMark && <List.Content floated='right'>
				<Popup
					key={subordinate.id}
					size='mini'
					position='bottom center'
					trigger={
						<Label
							size='big'
							className='assessment-profile__label'
							style={{
								backgroundColor: rules[overallMark] && rules[overallMark].color,
								borderColor: rules[overallMark] && rules[overallMark].color,
							}}
						>
							{overallMark}
						</Label>
					}
					content={rules[overallMark] && rules[overallMark].description}
				/>
			</List.Content>}

			{subordinate.avatarUrl ? <Image avatar src={subordinate.avatarUrl} /> : <Icon size='big' color='blue' name='user' />}
			<List.Content>
				<List.Header>{subordinate.fullname}</List.Header>
				<List.Description>{subordinate.department} -> {subordinate.position}</List.Description>
				<List.Description>
					<p className='assessment-profile-subordinate__decription'>
						{subordinate.assessment.stepName}
					</p>
				</List.Description>
			</List.Content>
			
		</List.Item>
	);
}

function mapStateToProps(state){
	const { profile } = state.app;
	return {
		rules: profile.rules,
	}
}

export default connect(mapStateToProps)(Subordinate);