var request = require("request"),
	_ = require("underscore")._;

exports["activities"] = {
	list: function(params, cb) {
		
	}
};

exports["channels"] = { 
	list: function(params, cb) {
		
	}
};

exports["guideCategories"] = { 
	list: function(params, cb) {
		
	}
};

exports["playlistItems"] = { 
	list: function(params, cb) {
		
	}
};

exports["playlists"] = { 
	list: function(params, cb) {
		
	}
};

exports["search"] = { 
	list: function(params, cb) {
		
		var reqString = "https://www.googleapis.com/youtube/v3/search";
		reqString += "?part=" + _.has(params, 'part') ? params.part : "id,kind,etag,snippet";
		if (_.has(params.q)) {
			reqString+= "&q=" + params.q;
		} else {
			reqString+= "&relatedToVideo=" + params.relatedToVideo;
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
					result = {errnum:1, errtxt:"req failed"}
				} finally {
					cb(result );	
				}
			}
		});
	}
	
};

exports["subscriptions"] = { 
	list: function(params, cb) {
		
	}
};

exports["videoCategories"] = { 
	list: function(params, cb) {
		
	}
};

exports["videos"] = { 
	list: function(params, cb) {
		
	}
};

/*
function(params, cb) {
	
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