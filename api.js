var spashttp = require("spas-http"),
	_ = require("underscore")._,
	async = require("async");

var getVideoDetails = function (credentials) {
	// If this bundle is using oauth2, add in the access token
	var tokenString =  _.isObject(credentials) && _.has(credentials, 'access_token') ? 
		"&access_token=" + credentials.access_token : 
		'';
	return function (obj, cb) {
		spashttp.request({url: "http://gdata.youtube.com/feeds/api/videos/" + obj.media$group.yt$videoid.$t + '?v=2&alt=json' + tokenString }, credentials, function( err, video ) {
			if(video && _.has(video, 'entry')) {
				obj.media$group.media$keywords.$t = video.entry.media$group.media$keywords.$t;
				obj.category = video.entry.category;
			}

			cb(err);
		});
	}
};
	
exports["custom"] = {	
	videosWithKeywords: function(params, credentials, cb) { 
		params.url = "http://gdata.youtube.com/feeds/api/videos?v=2";
		// Ensure we have a number to perform calculation.
		var maxResults = parseInt(params['max-results']) || 50;
		if (maxResults > 50) params['max-results'] = "50";
		var pages = Math.floor((maxResults-1)/50) + 1;
		var startIndices = [];
		// Prep an array for starting indices to use with `async.concat`
		for (var i = 0; i < pages; i++) { startIndices[i] = i*50 + 1; };

		// In order to concat the video entries only
		var data;

		async.concat(startIndices, function (startIndex, callback) {
			var shadowed = _.clone(params);
			shadowed['start-index'] = startIndex+'';

			spashttp.request(shadowed, credentials, function ( err, videos ) {
				if (_.has(videos, 'feed')) {
					// Save meta data outside.
					if (!data) data = videos;

					async.each(videos.feed.entry, getVideoDetails(credentials), function (err) {
						callback(err, videos.feed.entry);
					});
					
				} else {
					callback( err, videos );
				}
				
			});
		}, function(err, results) {
			// After concatenation is done, save the entries back and return.
			data.feed.entry = results;
			cb(err, data);
		});
		
		
	}
};
