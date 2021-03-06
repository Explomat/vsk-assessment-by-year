<%

//var curUserID = 6711785032659205612; // me test
var curUserID = 6770996101418848653; // user test
var ASSESSMENT_APPRAISE_ID = 6639285555245559685;
var WORK_FLOW_ID = 6639304998575803843;
var BOSS_COMPETENCE_PROFILE_ID = 6639286275839505392;
var USER_COMPETENCE_PROFILE_ID = 6639303242852679344;

/*var rules = [
	{
		scale: 'E',
		color: '#f57b7b',
		description: 'Компетенция не проявляется в поведении / преобладают только негативные проявления',
		percent: 10
	},
	{
		scale: 'D',
		color: '#f8a2a2',
		description: 'Положительно проявляются отдельно элементы компетенции, а остальные требуют развития',
		percent: 20
	},
	{
		scale: 'C',
		color: '#ffcc6e',
		description: 'Компетенция проявлена в полной мере. Сотрудник успешно применяет компетенцию в стандартных рабочих ситуациях',
		percent: 30
	},
	{
		scale: 'B',
		color: '#abdfab',
		description: 'Проявление компетенции превосходит ожидания. Компетенция успешно применяется не только в стандартных, но и в новых ситуациях',
		percent: 40
	},
	{
		scale: 'A',
		color: '#79d879',
		description: 'Проявление компетенции существенно превосходит ожидания. Поведение сотрудника является примером для других',
		percent: 50
	}
]*/

function _notificate(templateCode, primaryId, secondaryId, text){
	tools.create_notification(templateCode, primaryId, text, secondaryId);
}

function _assessmentBossByUser(userId){
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select ap.boss_id \n\
		from assessment_plans ap \n\
		where person_id = " + userId
	));
	return q == undefined ? q : q.boss_id;
}

function _assessmentPlanByUser(userId){
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select pas.assessment_plan_id \n\
		from pas \n\
		where \n\
			pas.person_id = " + userId + " \n\
			and pas.expert_person_id = " + userId + " \n\
			and pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID
	));
	return q == undefined ? q : q.assessment_plan_id;
}

function _assessmentStepByUser(userId){
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select ap.workflow_state as step \n\
		from pas \n\
		join assessment_plans ap on ap.id = pas.assessment_plan_id \n\
		where \n\
			pas.person_id = " + userId + " \n\
			and pas.expert_person_id = " + userId + " \n\
			and pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID
	));
	return q == undefined ? q : q.step;
}

function _paSelfByUser(userId){
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select pas.id \n\
		from pas \n\
		where \n\
			pas.person_id = " + userId + " \n\
			and pas.expert_person_id = " + userId + " \n\
			and pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID
	));
	return q == undefined ? q : q.id;
}

function get_UiStep(){
	var pa = ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			count(*) c \n\
		from pas \n\
		where \n\
			pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
			and pas.person_id = " + curUserID 
	));

	var step = pa.c == 0 ? 'first' : 'second';

	return tools.object_to_text({ step: step }, 'json');
}

function get_Collaborators(queryObjects) {
	var search = queryObjects.HasProperty('search') ? Trim(queryObjects.search) : '';

	var colls = XQuery("sql: \n\
		SELECT \n\
			TOP 5 \n\
			col.id, \n\
			col.fullname as title, \n\
			col.position_name as position, \n\
			col.position_parent_name as department, \n\
			(col.position_parent_name + ' -> ' + col.position_name) as description \n\
		FROM \n\
			collaborators as col \n\
		WHERE \n\
			col.is_dismiss = 0 \n\
			and col.id <> " + curUserID + " \n\
			and col.fullname LIKE ('%" + search + "%') \n\
	");

	return tools.object_to_text(colls, 'json');
}

function post_CreateInitialProfile(queryObjects){
	var data = tools.read_object(queryObjects.Body);
	var manager = data.HasProperty('manager') ? data.manager : null;
	var status = data.HasProperty('status') ? data.status : '';
	
	var profileId = (status == 'user' ? USER_COMPETENCE_PROFILE_ID : BOSS_COMPETENCE_PROFILE_ID);
	var profileCompetences = OpenDoc(UrlFromDocID(profileId)).TopElem.competences;

	try {
		//план оценки
		var docPlan = tools.new_doc_by_name('assessment_plan');
		docPlan.TopElem.assessment_appraise_id = ASSESSMENT_APPRAISE_ID;
		docPlan.TopElem.boss_id = manager.id;
		docPlan.TopElem.workflow_id = WORK_FLOW_ID;
		docPlan.TopElem.workflow_state = 1;
		docPlan.TopElem.person_id = curUserID;
		docPlan.BindToDb(DefaultDb);
		docPlan.Save();

		//самооценка
		var docSelf = tools.new_doc_by_name('pa');
		docSelf.TopElem.assessment_appraise_type = 'competence_appraisal';
		docSelf.TopElem.competence_profile_id = profileId;
		docSelf.TopElem.status = 'self';
		docSelf.TopElem.assessment_appraise_id = ASSESSMENT_APPRAISE_ID;
		docSelf.TopElem.workflow_id = WORK_FLOW_ID;
		docSelf.TopElem.workflow_state = 1;
		docSelf.TopElem.person_id = curUserID;
		docSelf.TopElem.expert_person_id = curUserID;
		docSelf.TopElem.competences.AssignElem(profileCompetences);
		docSelf.TopElem.assessment_plan_id = docPlan.DocID;
		docSelf.BindToDb(DefaultDb);
		docSelf.Save();

		_notificate('oc_1', manager.id, curUserID);
		return tools.object_to_text({
			success: true
		}, 'json');
	} catch(e) {
		return tools.object_to_text({
			error: e
		}, 'json');
	}
}


function _instruction() {
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select \n\
			t.p.query('text_area').value('.','varchar(MAX)') as instruction \n\
		from \n\
			documents ds \n\
		JOIN document d on d.id = ds.id \n\
		CROSS APPLY d.data.nodes('/document') AS t(p) \n\
		where \n\
			ds.id in ( \n\
				SELECT \n\
					t.p.query('manual_document_id').value('.','varchar(250)') as doc_id \n\
				from \n\
					assessment_appraises aas \n\
				join \n\
					assessment_appraise aa on aa.id = aas.id \n\
				CROSS APPLY aa.data.nodes('/assessment_appraise') AS t(p) \n\
				where \n\
					aas.id = " + ASSESSMENT_APPRAISE_ID + " \n\
				)"
	));
	return q == undefined ? '' : q.instruction;
}

function assessmentPlanForUser(userId){
	var q = XQuery("sql: \n\
		select \n\
		ap.workflow_state as step, \n\
		ap.integral_mark as overall, \n\
		w.name as stepName \n\
	from \n\
		assessment_plans ap, \n\
		(select \n\
			ws.id, \n\
			t.p.query('code').value('.','varchar(250)') as code, \n\
			t.p.query('name').value('.','varchar(250)') as name \n\
		from workflows ws \n\
		inner join workflow w on w.id = ws.id \n\
		CROSS APPLY w.data.nodes('/workflow/states/state') AS t(p) \n\
		where ws.id = " + WORK_FLOW_ID + ") w \n\
	where \n\
		ap.person_id = " + userId + " \n\
		and ap.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
		and ap.workflow_id = w.id \n\
		and ap.workflow_state = w.code \n\
	");

	return ArrayOptFirstElem(q);
}

function statusNameByStatusId(statusId){
	var q = ArrayOptFirstElem(XQuery("sql: \n\
		select p.name \n\
		from [common.assessment_appraise_participants] p \n\
		where p.id = '" + statusId + "'"
	));
	return q == undefined ? q : q.name;
}

function pasForUser(userId, status){

	var qs = "SELECT pas.id \n\
		FROM \n\
			pas \n\
		WHERE \n\
			pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
			and pas.person_id = " + userId

	if (status != undefined){
		qs = qs + " and pas.status = '" + status + "'";
	}

	var q = XQuery("sql:" + qs);

	var result = [];
	for (p in q){
		doc = OpenDoc(UrlFromDocID(Int(p.id)));
		statusName = statusNameByStatusId(String(doc.TopElem.status));
		d = {
			id: String(doc.TopElem.id),
			workflowState: String(doc.TopElem.workflow_state),
			workflowStateName: String(doc.TopElem.workflow_state_name),
			statusName: String(statusName),
			status: String(doc.TopElem.status),
			overall: String(doc.TopElem.overall),
			competences: []
		};

		for (c in doc.TopElem.competences){
			cc = {
				pa_id: String(p.id),
				competence_id: String(c.competence_id),
				weight: String(c.weight),
				mark_text: String(c.mark_text),
				mark_value: String(c.mark_value),
				indicators: []
			}

			for (i in c.indicators){
				cc.indicators.push({
					pa_id: String(p.id),
					indicator_id: String(i.indicator_id),
					weight: String(i.weight),
					mark_text: String(i.mark_text),
					mark_value: String(i.mark_value),
					comment: String(i.comment)
				});
			}
			d.competences.push(cc);
		}
		result.push(d);
	}
	return result;
}

function managerForUser(userId){
	var q = XQuery("sql: \n\
		select \n\
			c.id, \n\
			c.fullname, \n\
			c.position_name as position, \n\
			c.position_parent_name as department \n\
		from \n\
			collaborators c, \n\
			( \n\
				select ap.boss_id \n\
				from pas p \n\
				join assessment_plans ap on ap.id = p.assessment_plan_id \n\
				where  \n\
					p.person_id = " + userId + " \n\
					and p.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
			) p \n\
		where \n\
			c.id = p.boss_id\n\
	")

	return ArrayOptFirstElem(q);
}

function user(userId){
	var q = XQuery("sql: \n\
		SELECT \n\
			c.id, \n\
			c.fullname, \n\
			c.position_name as position, \n\
			c.position_parent_name as department, \n\
			m.[count] \n\
		FROM \n\
			collaborators c, \n\
			( \n\
				select count(*) as [count] \n\
				from assessment_plans ap \n\
				where \n\
					ap.boss_id = " + userId + " \n\
					and ap.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
			) m \n\
		WHERE \n\
			c.id = " + userId
	);
	var u = ArrayOptFirstElem(q);
	if (u != undefined){
		return {
			id: String(u.id),
			fullname: String(u.fullname),
			position: String(u.position),
			department: String(u.department),
			isManager: OptInt(u.count) >= 1
		}
	}
}

function subordinatesForUser(userId) {
	var q = XQuery("sql: \n\
		SELECT \n\
			c.id, \n\
			c.fullname, \n\
			c.position_name as position, \n\
			c.position_parent_name as department, \n\
			p.overall \n\
		FROM \n\
			collaborators c \n\
		JOIN \n\
			pas p on p.person_id = c.id \n\
		WHERE \n\
			p.expert_person_id = " + userId + " \n\
			and p.person_id <> " + userId
	);

	var result = [];
	for (s in q){
		plan = assessmentPlanForUser(String(s.id));
		data = {
			id: String(s.id),
			fullname: String(s.fullname),
			position: String(s.position),
			department: String(s.department),
			avatarUrl: ''
		}
		if (plan != undefined){
			data.assessment = {
				step: String(plan.step),
				stepName: String(plan.stepName),
				overall: String(s.overall)
			}
		} else {
			data.assessment = {};
		}

		result.push(data);
	}
	return result;
}

function commonCompetences(userId) {
	var q = XQuery("sql: \n\
		select cid.competence_id, cs.name \n\
		from \n\
			(select distinct\n\
				t.p.query('competence_id').value('.','varchar(250)') competence_id \n\
			from competence_profiles cps \n\
			JOIN pas p on p.competence_profile_id = cps.id \n\
			JOIN competence_profile cp on cp.id = cps.id \n\
			CROSS APPLY cp.data.nodes('/competence_profile/competences/competence') AS t(p) \n\
			where \n\
				p.person_id = " + userId + " \n\
				and p.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + ") cid \n\
		JOIN competences cs on cs.id = cid.competence_id \n\
	"); 

	var result = [];
	for (cp in q){
		comp = {
			id: String(cp.competence_id),
			name: String(cp.name),
			commonIndicators: []
		}
		qi = XQuery("sql: \n\
			select i.id \n\
			from indicators i \n\
			where i.competence_id = " + cp.competence_id
		);
		for (i in qi){
			iDoc = OpenDoc(UrlFromDocID(Int(i.id)));

			ind = {
				id: String(i.id),
				competence_id: String(iDoc.TopElem.competence_id),
				name: String(iDoc.TopElem.name),
				scales: []
			}
			for (s in iDoc.TopElem.scales){
				ind.scales.push({
					id: String(s.id),
					name: String(s.name),
					percent: String(s.percent),
					desc: String(s.desc),
					comment_require: String(s.comment_require)
				});
			}

			comp.commonIndicators.push(ind);
		}
		result.push(comp);
	}
	return result;
}

function _docWvars(id){
	var doc = OpenDoc(UrlFromDocID(Int(id)));

	var legends = ArrayOptFind(doc.TopElem.wvars, "This.name == 'assessment_by_year.legends'");
	var colors = ArrayOptFind(doc.TopElem.wvars, "This.name == 'assessment_by_year.colors'");
	var percents = ArrayOptFind(doc.TopElem.wvars, "This.name == 'assessment_by_year.percents'");


	var result = [];
	for (l in legends.entries) {
		obj = {
			scale: String(l.id),
			description: String(l.name)
		}

		cEntrie = ArrayOptFind(colors.entries, "This.id == '" + l.id + "'");
		obj.color = String(cEntrie.name);

		pEntrie = ArrayOptFind(percents.entries, "This.id == '" + l.id + "'");
		obj.percent = String(pEntrie.name);
		result.push(obj);
	}

	return result;
}


function get_Instruction(){
	var instruction = _instruction();
	return tools.object_to_text({
		instruction: String(instruction)
	}, 'json')
}

function get_SubordinateData(queryObjects){
	var userID = queryObjects.HasProperty('user_id') ? Trim(queryObjects.user_id) : curUserID;

	var userData = user(userID);
	var instruction = _instruction();
	var managerData = managerForUser(userID);
	var planData = assessmentPlanForUser(userID);
	//var pasData = pasForUser(userID, 'manager');
	var pasData = pasForUser(userID);
	var commonCompetencesData = commonCompetences(userID);
	var _rules = _docWvars(queryObjects.DocID);

	if (managerData != undefined){
		userData.manager = {
			id: String(managerData.id),
			fullname: String(managerData.fullname),
			position: String(managerData.position),
			department: String(managerData.department)
		}
	} else {
		userData.manager = {};
	}  

	if (planData != undefined){
		userData.assessment = {
			step: String(planData.step),
			stepName: String(planData.stepName),
			overall: String(planData.overall),
			pas: pasData
		}
	} else {
		userData.assessment = {}
	}

	return tools.object_to_text({
		meta: {
			curUserID: curUserID
		},
		instruction: String(instruction),
		user: userData,
		commonCompetences: commonCompetencesData,
		rules: _rules
	}, 'json');
}

function get_ProfileData(queryObjects){

	var userID = queryObjects.HasProperty('user_id') ? Trim(queryObjects.user_id) : curUserID;
	var d = OpenDoc(UrlFromDocID(Int(queryObjects.DocID)));

	var userData = user(userID);
	var instruction = _instruction();
	var managerData = managerForUser(userID);
	var planData = assessmentPlanForUser(userID);
	var pasData = pasForUser(userID);
	var subordinatesData = subordinatesForUser(userID);
	var commonCompetencesData = commonCompetences(userID);
	var _rules = _docWvars(queryObjects.DocID);

	if (managerData != undefined){
		userData.manager = {
			id: String(managerData.id),
			fullname: String(managerData.fullname),
			position: String(managerData.position),
			department: String(managerData.department)
		}
	} else {
		userData.manager = {};
	}  

	if (planData != undefined){
		userData.assessment = {
			step: String(planData.step),
			stepName: String(planData.stepName),
			overall: String(planData.overall),
			pas: pasData
		}
	} else {
		userData.assessment = {}
	}

	userData.subordinates = subordinatesData;

	return tools.object_to_text({
		meta: {
			curUserID: curUserID
		},
		instruction: String(instruction),
		user: userData,
		commonCompetences: commonCompetencesData,
		rules: _rules
	}, 'json');
}

function post_FourthStep(queryObjects) {
	var data = tools.read_object(queryObjects.Body);
	var answer = data.HasProperty('answer') ? Trim(data.answer) : '';
	//var pa_id = queryObjects.HasProperty('pa_id') ? OptInt(queryObjects.pa_id, null) : null;
	
	var comment = (answer == 'false' ? 'Не согласен с результатом' : 'Согласен с результатом');

	var q = ArrayOptFirstElem(XQuery("sql: \n\
		SELECT pas.id \n\
		FROM \n\
			pas \n\
		WHERE \n\
			pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
			and pas.person_id = " + curUserID + " \n\
			and pas.expert_person_id = " + curUserID
	));
	if (q != undefined){
		try {
			var paCard = OpenDoc(UrlFromDocID(Int(q.id)));
			paCard.TopElem.is_done = true;
			paCard.TopElem.comment = comment;
			paCard.TopElem.workflow_state = 4;
			paCard.TopElem.workflow_state_name = 'Оценка завершена';
			paCard.Save();

			var docPlan = OpenDoc(UrlFromDocID(paCard.TopElem.assessment_plan_id));
			docPlan.TopElem.workflow_state = 4;
			docPlan.TopElem.is_done = true;
			docPlan.Save();

			var bossId = _assessmentBossByUser(curUserID);

			if (bossId != undefined){
				_notificate('oc_4', bossId, curUserID, comment);
				_notificate('oc_5', curUserID, bossId);
			}

			return tools.object_to_text({ step: 4 }, 'json');
		} catch (e) {
			return tools.object_to_text({ status: 'error: ' + e }, 'json');
		}
	}
}

function post_ThirdStep(queryObjects){
	var data = tools.read_object(queryObjects.Body);
	var paId = data.HasProperty('id') ? data.id : null;
	var overall = data.HasProperty('overall') ? data.overall : '';
	var _competences = data.HasProperty('competences') ? data.competences : null;

	var curPaCard = OpenDoc(UrlFromDocID(Int(paId)));
	for (elem in _competences) {
		comp = ArrayOptFind(curPaCard.TopElem.competences, 'This.competence_id == ' + elem.competence_id);
		if (comp != undefined) {
			comp.mark_value = elem.mark_value;
			comp.mark_text = elem.mark_text;
			for (indicator in elem.indicators) {
				ind = ArrayOptFind(comp.indicators, 'This.indicator_id == ' + indicator.indicator_id);
				if (ind != undefined) {
					ind.mark_value = indicator.mark_value;
					ind.mark_text = indicator.mark_text;
					ind.comment = indicator.comment;
				}
			}
		}
	}

	curPaCard.TopElem.overall = overall;
	curPaCard.TopElem.workflow_state = 3;
	curPaCard.TopElem.workflow_state_name = 'Ознакомление сотрудника';
	curPaCard.Save();

	var docPlan = OpenDoc(UrlFromDocID(curPaCard.TopElem.assessment_plan_id));
	docPlan.TopElem.workflow_state = 3;
	docPlan.Save();

	_notificate('oc_3', curPaCard.TopElem.person_id, curUserID);
	return tools.object_to_text({
		step: 3
	}, 'json');
}

function post_SecondStep(queryObjects){
	var data = tools.read_object(queryObjects.Body);
	var paId = data.HasProperty('id') ? data.id : null;
	var overall = data.HasProperty('overall') ? data.overall : '';
	var _competences = data.HasProperty('competences') ? data.competences : null;

	// type 2 типов user и boss ( кто сохраняет)

	//оценка руководителя
	var docPaUser = OpenDoc(UrlFromDocID(Int(paId)));
	var profileId = docPaUser.TopElem.competence_profile_id;
	var profileCompetences = OpenDoc(UrlFromDocID(profileId)).TopElem.competences;

	var docPlan = OpenDoc(UrlFromDocID(docPaUser.TopElem.assessment_plan_id));
	docPlan.TopElem.workflow_state = 2;
	docPlan.Save();

	var docManager = tools.new_doc_by_name('pa');
	docManager.TopElem.assessment_appraise_type = 'competence_appraisal';
	docManager.TopElem.competence_profile_id = profileId;
	docManager.TopElem.status = 'manager';
	docManager.TopElem.assessment_appraise_id = ASSESSMENT_APPRAISE_ID;
	docManager.TopElem.workflow_id = WORK_FLOW_ID;
	docManager.TopElem.workflow_state = 2;
	docManager.TopElem.person_id = curUserID;
	docManager.TopElem.expert_person_id = docPlan.TopElem.boss_id;
	docManager.TopElem.competences.AssignElem(profileCompetences);
	docManager.TopElem.assessment_plan_id = docPlan.DocID;
	docManager.BindToDb(DefaultDb);
	docManager.Save();

	try {
		curPaCard = OpenDoc(UrlFromDocID(Int(paId)));
		for (elem in _competences) {
			comp = ArrayOptFind(curPaCard.TopElem.competences, 'This.competence_id == ' + elem.competence_id);
			if (comp != undefined) {
				comp.mark_value = elem.mark_value;
				comp.mark_text = elem.mark_text;
				for (indicator in elem.indicators) {
					ind = ArrayOptFind(comp.indicators, 'This.indicator_id == ' + indicator.indicator_id);
					if (ind != undefined) {
						ind.mark_value = indicator.mark_value;
						ind.mark_text = indicator.mark_text;
						ind.comment = indicator.comment;
					}
				}
			}
		}

		curPaCard.TopElem.overall = overall;
		curPaCard.TopElem.workflow_state = 2;
		curPaCard.TopElem.workflow_state_name = 'Оценка руководителя';
		curPaCard.Save();

		_notificate('oc_2', docPlan.TopElem.boss_id, curUserID);
	} catch(e){alert(e);}

	return tools.object_to_text({
		step: 2
	}, 'json');
}

function post_ResetManager(){
	var q = XQuery("sql: \n\
		select p.id \n\
		from pas p \n\
		where p.person_id = " + curUserID
	);

	var planId = null;

	for (p in q){
		try {
			docPaUser = OpenDoc(UrlFromDocID(Int(p.id)));
			planId = docPaUser.TopElem.assessment_plan_id;
			DeleteDoc(UrlFromDocID(Int(p.id)));
		} catch(e) {
			alert(e);
		}
	}
	if (planId != null){
		DeleteDoc(UrlFromDocID(Int(planId)));
	}
	return tools.object_to_text({
		step: 'first'
	}, 'json');
}


function get_Report(queryObjects){
	function pasForUserReport(userId, status){

		var qs = "SELECT pas.id, pas.person_fullname \n\
			FROM \n\
				pas \n\
			WHERE \n\
				pas.assessment_appraise_id = " + ASSESSMENT_APPRAISE_ID + " \n\
				and pas.person_id = " + userId

		if (status != undefined){
			qs = qs + " and pas.status = '" + status + "'";
		}

		var q = XQuery("sql:" + qs);

		var result = [];
		for (p in q){
			doc = OpenDoc(UrlFromDocID(Int(p.id)));
			d = {
				person_name: String(p.person_fullname),
				status: String(doc.TopElem.status),
				overall: String(doc.TopElem.overall),
				comment: String(doc.TopElem.comment),
				competences: []
			};

			for (c in doc.TopElem.competences){
				comp = c.competence_id.OptForeignElem;
				cc = {
					competence_name: String(comp.name),
					mark_text: String(c.mark_text),
					mark_value: String(c.mark_value),
					indicators: []
				}

				for (i in c.indicators){
					ind = i.indicator_id.OptForeignElem;
					cc.indicators.push({
						indicator_name: String(ind.name),
						mark_text: String(i.mark_text),
						mark_value: String(i.mark_value),
						comment: String(i.comment)
					});
				}
				d.competences.push(cc);
			}
			result.push(d);
		}
		return result;
	}

	function columnNameByIndex (d){
		var colName = '';
		while (d > 0) {
			m = (d - 1) % 26;
			colName = String.fromCharCode(65 + m) + colName;
			d = Int((d - m) / 26)
		}
		return colName;
	}

	function colorByMark(mark, __rules){
		var c = ArrayOptFind(__rules, "This.scale == '" + mark + "'");
		return c == undefined ? c : c.color;
	}

	function markByPercent(percent, __rules){
		var c = ArrayOptFind(__rules, "This.percent == '" + percent + "'");
		return c == undefined ? c : c.scale;
	}

	function setMaxColWith(value, widths, index){
		var count = StrCharCount(value);
		widths[index] = count > widths[index] ? count : widths[index];
	}

	var userID = queryObjects.HasProperty('user_id') ? Trim(queryObjects.user_id) : curUserID;
	var _rules = _docWvars(queryObjects.DocID);
	var path = UrlToFilePath(ObtainTempFile('.xlsx'));
	var oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
	oExcelDoc.CreateWorkBook();
	var oWorksheet = oExcelDoc.GetWorksheet(0);

	var _paSelf = ArrayOptFirstElem(pasForUserReport(userID, 'self'));
	var _paManager = ArrayOptFirstElem(pasForUserReport(userID, 'manager'));
	var colWidths = [];
	var	rindex = 1;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = _paSelf.person_name;
	oCell.Style.FontSize = 14;
	oCell.Style.FontColor = "#444444"; 
	oCell.Style.IsBold = true;
	rindex = rindex + 2;


	oCell = oWorksheet.Cells.GetCell('A'  + rindex);
	oCell.Value = 'Компетенции';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[0] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = 'Оценка сотрудника';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[1] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('C' + rindex);
	oCell.Value = 'Оценка руководителя';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[2] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('D' + rindex);
	oCell.Value = 'Название индикатора';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[3] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('E' + rindex);
	oCell.Value = 'Подтверждающий пример';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[4] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('F' + rindex);
	oCell.Value = 'Оценка сотрудника';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[5] = StrCharCount(oCell.Value) * (12.0 / 9);

	oCell = oWorksheet.Cells.GetCell('G' + rindex);
	oCell.Value = 'Оценка руководителя';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.IsBold = true;
	oCell.Style.VerticalAlignment = 'Center';
	colWidths[6] = StrCharCount(oCell.Value) * (12.0 / 9);
	colWidths[7] = StrCharCount(oCell.Value) * (12.0 / 9);

	rindex = rindex + 1;

	for (i = 0; i < ArrayCount(_paSelf.competences); i = i + 1) {
		cindex = 1;
		cSelf = _paSelf.competences[i];
		cManager = _paManager != undefined ? _paManager.competences[i] : undefined;

		oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
		oCell.Value = cSelf.competence_name;
		setMaxColWith(oCell.Value, colWidths, cindex);
		cindex = cindex + 1;

		oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
		oCell.Value = cSelf.mark_text;
		oCell.Style.ForegroundColor = colorByMark(cSelf.mark_text, _rules);
		setMaxColWith(oCell.Value, colWidths, cindex);
		cindex = cindex + 1;

		if (cManager != undefined){
			oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
			oCell.Value = cManager.mark_text;
			oCell.Style.ForegroundColor = colorByMark(cManager.mark_text, _rules);
			setMaxColWith(oCell.Value, colWidths, cindex);
		}
		cindex = cindex + 1;
		

		rindex = rindex + 1;

		for (j = 0; j < ArrayCount(cSelf.indicators); j = j + 1) {
			prevCindex = cindex;
			iSelf = cSelf.indicators[j];
			iManager = cManager != undefined ? cManager.indicators[j] : undefined;

			oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
			oCell.Value = iSelf.indicator_name;
			setMaxColWith(oCell.Value, colWidths, cindex);
			cindex = cindex + 1;

			oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
			oCell.Value = iSelf.comment;
			setMaxColWith(oCell.Value, colWidths, cindex);
			cindex = cindex + 1;

			oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
			oCell.Value = iSelf.mark_text;
			oCell.Style.ForegroundColor = colorByMark(iSelf.mark_text, _rules);
			setMaxColWith(oCell.Value, colWidths, cindex);
			cindex = cindex + 1;

			if (iManager != undefined){
				oCell = oWorksheet.Cells.GetCell(columnNameByIndex(cindex) + rindex);
				oCell.Value = iManager.mark_text;
				oCell.Style.ForegroundColor = colorByMark(iManager.mark_text, _rules);
				setMaxColWith(oCell.Value, colWidths, cindex);
				
			}
			cindex = cindex + 1;
			
			rindex = rindex + 1;
			cindex = prevCindex;
		}
		rindex = rindex + 1;
	}

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'Итоговая оценка сотрудника';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.IsBold = true;

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = markByPercent(_paSelf.overall, _rules);
	oCell.Style.ForegroundColor = colorByMark(oCell.Value, _rules);
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.IsBold = true;
	rindex = rindex + 2;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = 'Итоговая оценка руководителя';
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.IsBold = true;

	if (_paManager != undefined) {
		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = markByPercent(_paManager.overall, _rules);
		oCell.Style.ForegroundColor = colorByMark(oCell.Value, _rules);
		oCell.Style.FontSize = 12;
		oCell.Style.FontColor = "#444444";
		oCell.Style.IsBold = true;
	}
	rindex = rindex + 2;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = _paSelf.comment;
	oCell.Style.FontSize = 12;
	oCell.Style.FontColor = "#444444";
	oCell.Style.IsBold = true;
	

	//alert(tools.object_to_text(colWidths, 'json'));

	for (i = 0; i < colWidths.length - 1; i = i + 1){
		oWorksheet.Cells.SetColumnWidth(i, colWidths[i + 1]);
	}

	oWorksheet.Cells.SetRowHeight(2, 30.0);

	oExcelDoc.SaveAs(path);

	Request.AddRespHeader('Content-Type', 'application/octet-stream');
	Request.AddRespHeader('Content-disposition', 'attachment; filename=report.xlsx');
	return LoadFileData(path);
}
%>