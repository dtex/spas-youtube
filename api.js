var request = require("request"),
	_ = require("underscore")._;

exports["activities"] = {
	list: function(params, credentials, cb) {
		
	}
};

exports["channels"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["guideCategories"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["playlistItems"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["playlists"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["search"] = { 
	list: function(params, credentials, cb) {
		
		var reqString = "https://www.googleapis.com/youtube/v3/search";
		
		reqString += "?part=" + (_.has(params, 'part') ? params.part : "snippet");
		
		if (_.has(params, 'q')) {
			reqString += "&q=" + params.q;
		} else {
			reqString += "&relatedToVideo=" + params.relatedToVideo;
		}
		if (_.has(credentials, 'access_token')) {
			reqString += "&access_token=" + credentials.access_token;
		}
		
		_.each(params, function(val, key) {
			if(key !== 'part' && key !== 'q' && key !== 'relatedToVideo') {
				reqString += first ? '?' : '&';
				reqString += key + '=' + val;
				first = false;
			}
		});
		
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
	
};

exports["subscriptions"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["videoCategories"] = { 
	list: function(params, credentials, cb) {
		
	}
};

exports["videos"] = { 
	list: function(params, credentials, cb) {
		
	}
};

/*
function(params, credentials, cb) {
	
	var reqString = params.url,
		first = true;
	
	_.each(params, function(val, key) {
		if(key !== 'url') {
			reqString += first ? '?' : '&';
			reqString += key + '=' + val;
			first = false;
		}
	});
	
	request(reqString, function (err, res, body) {
		if (!err && res.statusCode == 200) {
			cb(null, JSON.parse(body))
		} else {
			var result;
			try {
				result = JSON.parse(body);
			} catch(e) {
				result = {errnum:1, errtxt:"req failed"}
			} finally {
				cb(result );	
			}
		}
	});
	
}
*/