var spasRequest = require("../spas-request"),
	_ = require("underscore")._;
	
exports["custom"] = {	
	videosWithKeywords: function(params, credentials, cb) { 
		
		params.url = "http://gdata.youtube.com/feeds/api/videos?v=2";
		
		spasRequest.request(params, credentials, function( err, videos ) {
			
			if (_.has(videos, 'feed')) {
				
				var n = videos.feed.entry.length;
				
				_.each(videos.feed.entry, function( obj, key) {
					spasRequest.request({url: "http://gdata.youtube.com/feeds/api/videos/" + obj.media$group.yt$videoid.$t + '?v=2&alt=json'}, credentials, function( err, video ) {
						n=n-1;
						if(_.has(video, 'entry')) {
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
