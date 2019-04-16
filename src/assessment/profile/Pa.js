import React from 'react';
import { Header, Segment, Label, Icon } from 'semantic-ui-react';
import { computeResultMark } from '../calculations';
import cs from 'classnames';

const Pa = ({ pa, CompetenceContainer, ...props }) => {

	const renderResultMark = (resultMark) => {
		const { rules } = props;
		const color = rules[resultMark] && rules[resultMark].color;
		return resultMark && (
			<Label
				size='large'
				className='assessment-profile__label'
				style={{
					backgroundColor: color,
					borderColor: color,
					float: 'right'
				}}
			>
				{resultMark}
			</Label>
		);
	}

	const resultMark = computeResultMark(pa.id, props);
	const renderedResultMark = renderResultMark(resultMark);
	return (
		<Segment clearing key={pa.id} className='assessment-profile__pa'>
			{props.isHeaderOpened && <div className='assessment-profile__pa_header' onClick={() => props.onTogglePa(pa.id)}>
				<Header as='h3'>
					{/*!ui.pas[pa.id] ? <Icon name='angle up' /> : <Icon name='angle down' /> */}
					{props.isOpened ? <Icon name='angle down' /> : <Icon name='angle up' />}
					<Header.Content style={{ width: '100%' }}>{pa.statusName} {renderedResultMark}</Header.Content>
				</Header>
			</div>}
			<div className={cs({
				'assessment-profile__pa-content':  true,
				'assessment-profile__pa-content--visible': props.isOpened
			})}>
				<div className='assessment-profile__competences'>
					{pa.competences.map(c => <CompetenceContainer
							isDisabled={props.isDisabled}
							key={c}
							id={c}
						/>
					)}
				</div>
				<Header floated='right' as='h3'>Итоговый результат 
					{renderedResultMark}
				</Header>
			</div>
		</Segment>
	);
}

export default Pa;