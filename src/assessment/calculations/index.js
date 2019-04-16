import { find, findKey } from 'lodash';
import boolean from 'boolean';

const isCommentRequire = (scales, markText) => {
	const t = find(scales, { name: markText });
	return t ? boolean(t.comment_require) : false;
}

const isCompetenceCompleted = (competenceId, props) => {
	const { competences, indicators, commonIndicators } = props;

	const comp = competences[competenceId];
	const f = comp.indicators.filter(i => {
		const ind = indicators[i];
		const commonI = commonIndicators[commonId(i)];
		const mark = ind.mark_text;
		const result = (
			mark === '' ||
			(isCommentRequire(commonI.scales, mark) && !ind.comment)
		)
		return result;
	});
	return f.length === 0;
}

const isCompetencesCompleted = (props) => {
	const { competences } = props;

	const ids = Object.keys(competences);

	const len = ids.filter(c => isCompetenceCompleted(c, props)).length;
	return len === ids.length;
}

const computeCompetencePercent = (competenceId, props) => {
	const { competences, indicators, commonIndicators } = props;

	const comp = competences[competenceId];
	const percents = comp.indicators.map(i => {
		const ui = indicators[i];
		const ci = commonIndicators[commonId(i)];
		const s = find(ci.scales, { name: ui.mark_text });
		if (s) return s.percent;
		return 0;
		//return ci.scales[0].percent;
	});
	const total = percents.reduce((f, s) => {
		return parseInt(f, 10) + parseInt(s, 10);
	}, 0);

	const average = Math.round((total / percents.length) * 100) / 100;

	return average;
}

const computeScaleByPercent = (percent, props) => {
	const { rules } = props;
	const r = Math.round(percent / 10) * 10;

	const s = findKey(rules, { percent: r.toString() });
	if (s) return rules[s].scale;
	return null;
	//return legends[0].scale;
}

const computeCompetenceMark = (competenceId, props) => {
	const percent = computeCompetencePercent(competenceId, props);
	return computeScaleByPercent(percent, props);
}

const computeResultMark = (paId, props) => {
	const { pas } = props;
	const pa = pas[paId];
	const comps = pa.competences;
	const percents = comps.reduce((f, s) => f += computeCompetencePercent(s, props), 0);
	const r = percents / comps.length;
	return computeScaleByPercent(r, props);
}

//т.к. id индикатора теперь имеет вид paId-competenceId-indicatorId,
// комптенции paId-competenceId для уникальности,
// то нужно вычленить сам id для commonIndicators и commonCompetences
const commonId = id => {
	const arr = id.split('_');
	return arr[arr.length - 1];
}

export {
	isCommentRequire,
	computeCompetenceMark,
	computeResultMark,
	isCompetenceCompleted,
	isCompetencesCompleted,
	commonId
}