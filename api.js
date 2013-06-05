var spashttp = require("spas-http"),
	_ = require("underscore")._;
	
exports["custom"] = {	
	videosWithKeywords: function(params, credentials, cb) { 
		
		params.url = "http://gdata.youtube.com/feeds/api/videos?v=2";
		
		spashttp.request(params, credentials, function( err, videos ) {
			
			if (_.has(videos, 'feed')) {
				
				var n = videos.feed.entry.length;
				
				// If this bundle is using oauth2, add in the access token
				var tokenString =  _.isObject(credentials) && _.has(credentials, 'access_token') ? 
					"&access_token=" + credentials.access_token : 
					'';
				
				_.each(videos.feed.entry, function( obj, key) {
					spashttp.request({url: "http://gdata.youtube.com/feeds/api/videos/" + obj.media$group.yt$videoid.$t + '?v=2&alt=json' + tokenString }, credentials, function( err, video ) {
						n=n-1;
						if(video && _.has(video, 'entry')) {
							videos.feed.entry[key].media$group.media$keywords.$t = video.entry.media$group.media$keywords.$t;
							videos.feed.entry[key].category = video.entry.category;
						}
						if (n === 0) {
							cb( null, videos );
						}
					});
				});
				
			} else {
				cb( err, videos );
			}
			
		});
	}
};
