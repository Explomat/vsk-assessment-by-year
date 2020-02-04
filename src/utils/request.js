export function pureUrl(){
	return window.location.protocol + '//192.168.73.37';
	/*return process.env.NODE_ENV === 'production' ?
			window.location.protocol + '//e-learning.vsk.ru' : window.location.protocol + '//192.168.73.37';*/
	//return `${window.location.protocol}//e-learning.vsk.ru`;
	//return 'https://e-learning.vsk.ru';
}

export function createBaseUrl(action_name){
	action_name = action_name || '';

	const baseUrl = pureUrl() + '/custom_web_template.html';

	window.routerId = '6727531844004172765';
	window.serverId = '6672233575633323919';
	return `${baseUrl}?object_id=${window.routerId}&server_id=${window.serverId}&action_name=${action_name}&r=${(new Date()).getTime()}`
}

const request = action_name => {
	const _url = createBaseUrl(action_name);

	return {
		get: (params = {}, config) => {
			const url = new URL(_url);
			Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
			return fetch(url, config);
		},
		post: (data, config) => {
			return fetch(_url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				},
				...config
			}).then(r => r.json());
		}
	}
}

export default request;