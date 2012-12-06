var request = require("request"),
	_ = require("underscore")._,
	url = "https://www.googleapis.com/youtube/v3/";
	
var makeRequest = function(reqString, credentials, cb) {
	
	if (_.has(credentials, 'access_token')) {
		reqString += "&access_token=" + credentials.access_token;
	}
	
	request(reqString, function (err, res, body) {
		if (!err && res.statusCode == 200) {
			cb(null, JSON.parse(body))
		} else {
			var result;
			try {
				result = JSON.parse(body);
			} catch(e) {
				result = {errnum:1, errtxt: body}
			} finally {
				cb(result );	
			}
		}
	});
}

var getParts = function(params, partsList) {
	return ("?part=" + (_.has(params, 'part') ? params.part : partsList));
}

var getOne = function(params, pickList) {
	var result = "";
	_.each(pickList, function(val, key) {
		if (_.has(params, val)) {
			result = "&" + val + "=" + params[val]
		}
	});
	return result;
}

var getExcluding = function(params, ignoreList) {
	var result = "";
	_.each(params, function(val, key) {
		if(ignoreList.indexOf(key) === -1 ) {
			result += "&" + key + '=' + val;
		}
	});
	return result;
}


/* --------------- */

exports["activities"] = {
	list: function(params, credentials, cb) {
		var reqString = url+"activities";
		reqString += getParts(params, "id,snippet,contentDetails");
		reqString += getOne(params, ['channelId', 'home', 'mine']);
		reqString += getExcluding(params, ['part', 'channelId', 'home', 'mine']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["channels"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"channels";
		reqString += getParts(params, "id,snippet,contentDetails,statistics,topicDetails");
		reqString += getOne(params, ['id', 'regionCode']);
		reqString += getExcluding(params, ['part', 'id', 'regionCode']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["guideCategories"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"guideCategories";
		reqString += getParts(params, "id,snippet");
		reqString += getOne(params, ['id', 'mine', 'categoryId','mySubscribers']);
		reqString += getExcluding(params, ['part', 'id', 'mine', 'categoryId','mySubscribers']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["playlistItems"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"playlistItems";
		reqString += getParts(params, "id,snippet,contentDetails");
		reqString += getOne(params, ['id', 'playlistId']);
		reqString += getExcluding(params, ['part', 'id', 'playlistId']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["playlists"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"playlists";
		reqString += getParts(params, "id,snippet,status");
		reqString += getOne(params, ['id', 'mine','channelId']);
		reqString += getExcluding(params, ['part', 'id', 'mine','channelId']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["search"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"search";
		reqString += getParts(params, "id,snippet");
		reqString += getOne(params, ['q', 'relatedToVideo']);
		reqString += getExcluding(params, ['part', 'q', 'relatedToVideo']);
		makeRequest(reqString, credentials, cb);
	}
	
};

exports["subscriptions"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"subscriptions";
		reqString += getParts(params, "id,snippet,contentDetails");
		reqString += getOne(params, ['channelId', 'id', 'mine']);
		reqString += getExcluding(params, ['part', 'channelId', 'id', 'mine']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["videoCategories"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"videoCategories";
		reqString += getParts(params, "id,snippet");
		reqString += getOne(params, ['id', 'regionCode']);
		reqString += getExcluding(params, ['part', 'id', 'regionCode']);
		makeRequest(reqString, credentials, cb);
	}
};

exports["videos"] = { 
	list: function(params, credentials, cb) {
		var reqString = url+"videos";
		reqString += getParts(params, "id,snippet,contentDetails,player,statistics,status,topicDetails");
		reqString += getExcluding(params, ['part']);
		makeRequest(reqString, credentials, cb);
	}
};
