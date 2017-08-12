var ajaxCustom = {};

ajaxCustom.ajaxGet = function(context, url, parse, callback, errCallback){
	url = 'http://'+window.localUrl+'/'+url;
	if(typeof(parse) == "function" && errCallback == undefined){
		errCallback=callback;
		callback=parse;
		parse={};
	}
	parse._token = window._token;
	context.$http.get(url, parse).then(callback, errCallback);
}

ajaxCustom.ajaxPost = function(context, url, parse, callback, errCallback){
	url = 'http://'+window.localUrl+'/'+url;
	if( typeof(parse) == "function" && errCallback == undefined){
		errCallback=callback;
		callback=parse;
		parse={};	
	}
	parse._token = window._token;
	context.$http.post(url, parse).then(callback, errCallback);
}

export default ajaxCustom;
