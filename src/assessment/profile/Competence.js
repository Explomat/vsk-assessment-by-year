import React, { Component } from 'react';
import { Icon, Table, Label, Popup } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import { connect } from 'react-redux';
import { find } from 'lodash';
import pSBC from '../../utils/pSBC';
import boolean from 'boolean';
import cs from 'classnames';
import {
	computeCompetenceMark,
	isCompetenceCompleted,
	isCommentRequire,
	commonId
} from '../calculations';


class Competence extends Component {

	constructor(props) {
		super(props);

		this.competenceRef = React.createRef();
		this.handleChangeMark = this.handleChangeMark.bind(this);
		this.handleFocus = this.handleFocus.bind(this);
		
		this.myrefs = {};
		const { indicators } = this.props;
		const self = this;
		Object.keys(indicators).forEach(i => {
			self.myrefs[i] = React.createRef();
		});
	}

	handleFocus(indicatorId, markName){
		const { indicators, commonIndicators } = this.props;
		const userInd = indicators[indicatorId];
		const commonInd = commonIndicators[commonId(indicatorId)];
		if (isCommentRequire(commonInd.scales, markName) && userInd.comment.trim() == '') {
			this.myrefs[indicatorId].current.focus();
		}
	}

	handleChangeMark(i, name, scales){
		this.props.changeMark(i, name, scales);
		this.handleFocus(i, name);
	}

	render(){
		const {
			id,
			isDisabled,
			competences,
			commonCompetences,
			indicators,
			commonIndicators,
			rules,
			changeMark,
			changeComment
		} = this.props;

		const userComp = competences[id];
		const commonComp = commonCompetences[commonId(id)];
		const mark = computeCompetenceMark(id, this.props);

		return(
			<div ref={this.competenceRef} className='assessment-profile__competences-container'>
				<Label className='fluid' size='large'>
					{mark && <Label className='assessment-profile__label' size='large' style={{
						backgroundColor: rules[mark].color,
						borderColor: pSBC(-0.5,rules[mark].color)
					}} ribbon>
						<strong>{mark}</strong>
					</Label>}
					{commonComp.name}
					{isCompetenceCompleted(id, this.props) &&
						<Icon className='assessment-profile__competences-container-complete' size='large' color='green' name='check' />
					}
				</Label>
				<Table
					celled
					size='small'
					className='assessment-profile__competence'
					style={{ margin: 0 }}
				>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Поведенческие индикаторы</Table.HeaderCell>
							<Table.HeaderCell>Шкала оценки</Table.HeaderCell>
							<Table.HeaderCell>Подтверждающий пример</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{userComp.indicators.map((i, index) => {
							const userInd = indicators[i];
							const commonInd = commonIndicators[commonId(i)];
							const isRequireComment = isCommentRequire(commonInd.scales, userInd.mark_text) && userInd.comment.trim() == '';
							return (
								<Table.Row key={index} disabled={isDisabled}>
									<Table.Cell
										textAlign='left'
										width={6}
									>
										{commonInd.name}
									</Table.Cell>
									<Table.Cell
										textAlign='left'
										width={3}
									>
										<Label.Group>
											{commonInd.scales.map(s => {
												const scale = rules[s.name];
												return (
													<Popup
														key={s.id}
														size='mini'
														position='top right'
														trigger={
															<Label
																className={`assessment-profile__label ${cs({
																	'assessment-profile__label--active' : userInd.mark_text === s.name
																})}`}
																style={{
																	backgroundColor: scale.color,
																	borderColor: scale.color
																}}
																as='a'
																onClick={() => this.handleChangeMark(i, s.name, commonInd.scales)}
															>
																{userInd.mark_text === s.name && <Icon name='check' />}
																{s.name}
															</Label>
														}
														content={s.desc}
													/>
												);
											})}
										</Label.Group>
									</Table.Cell>
									<Table.Cell width={3} style={{ position: 'relative' }}>
										<TextareaAutosize
											inputRef={this.myrefs[i]}
											className={
												cs({
													'assessment-profile__competences-container__text-area': true,
													'assessment-profile__competences-container__text-area--error': isRequireComment
												})
											}
											minRows={1}
											maxRows={3}
											placeholder='Пример'
											value={userInd.comment}
											onChange={(e) => changeComment(i, e.target.value)}
										/>
										{isRequireComment && <Label size='tiny' className='assessment-profile__competences-container-tooltip' basic color='red' pointing='below'>
											Заполните это поле
										</Label>}
										{/*<Popup
											hideOnScroll
											size='tiny'
											disabled={!isRequireComment}
											open={isRequireComment}
											position='right center'
											style={{
												color: '#636363',
												zIndex: 1000
											}}
											trigger={
												<div style={{ position: 'absolute', top: 0, right: 0, width: '100%', height: '100%', 'zIndex': -1 }}></div>
											}
											content='Заполните это поле'
										/>*/}
									</Table.Cell>
								</Table.Row>
							)
						})}
					</Table.Body>
				</Table>
			</div>
		);
	}
}

export default Competence;