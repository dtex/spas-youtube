var spashttp = require("spas-http"),
  _ = require("underscore")._,
  async = require("async");

var getVideoDetails = function (credentials) {
  'use strict';
  // If this bundle is using oauth2, add in the access token
  var tokenString = _.isObject(credentials) && _.has(credentials, 'access_token') ? 
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
  };
};
  
exports.custom = { 
  videosWithKeywords: function(params, credentials, cb) { 
    'use strict';
    params.url = "http://gdata.youtube.com/feeds/api/videos?v=2";
    // Ensure we have a number to perform calculation.
    var maxResults = parseInt(params['max-results']) || 50;
    var pages = Math.floor((maxResults-1)/50) + 1;
    var startIndices = [];
    // Prep an array for starting indices to use with `async.concat`
    for (var i = 0; i < pages; i++) { startIndices[i] = i*50 + 1; };

    // In order to concat the video entries only
    var data;

    async.concat(startIndices, function (startIndex, callback) {
      var shadowed = _.clone(params);
      shadowed['max-results'] = maxResults >= 50 ? '50' : maxResults.toString(10);
      shadowed['start-index'] = startIndex.toString(10);

      spashttp.request(shadowed, credentials, function ( err, videos ) {
        if (_.has(videos, 'feed') && videos.feed.entry) {
          // Save meta data outside.
          if (!data) data = videos;

          async.each(videos.feed.entry, getVideoDetails(credentials), function (err) {
            callback(err, videos.feed.entry);
          });
          
        } else {
          callback( err, [] );
        }
        
      });
    }, function(err, results) {
      // After concatenation is done, save the entries back and return.
      data.feed.entry = results;
      cb(err, data);
    });
    
    
  }
};

var BASE_V3_API = "https://www.googleapis.com/youtube/v3";

function channels(params, credentials, cb) {
  'use strict';
  /* Clone the params to avoid messing with the API data */
  params = _.clone(params);

  params.url = BASE_V3_API + "/channels";
  if (!params.forUsername) {
    params.mine = true;
  }

  if (!params.part) {
    params.part = "contentDetails";
  }

  if (credentials && credentials.access_token) {
    params.access_token = credentials.access_token;
  }

  return spashttp.request(params, credentials, function (err, channelsResult) {
    if (err) {
      return cb(err, channelsResult);
    }

    if (channelsResult.error) {
      return cb(channelsResult.error, null);
    }

    cb(null, channelsResult.items[0][params.part]);
  });
}

/**
 * Recursively retrieves videos from a playlist
 *
 * @param {string} playlistId - The ID of the playlist.
 * @param {string} [part=snippet] - comma-separated list of data to retrieve.
 * @param {Number} [maxResults] - how many to pull if set. Otherwise,
 *        pull all videos.
 *
 * The function requests items in playlist recursively until there  
 * is no `.nextPageToken` in the response. The `params.maxResults`
 * will be recalculated to see if next request is needed.
 
 * When `params.maxResults` is set to less than 50, first request
 * returns the exact amount specified, and function terminates.
 *
 * Now, if it is set to greater than 50, the first request is capped
 * at 50 (due to API's limit). The response will contain the next
 * page token if the total results are more than 50. Substracting
 * the different between acquired items and `params.maxResults`
 * will give the next `params.maxResults` to query.
 *
 * Another extreme case is `params.maxResults` set to really high,
 * way over the total results. In this case, at the last recursive
 * call for `totalResults % 50`, there won't be `.nextPageToken`,
 * so there won't be next call, fulfill the set.
 */
function playlistItems(params, credentials, cb) {
  'use strict';
  /* Clone the params to avoid messing with the API data */
  params = _.clone(params);
  
  if (!params.playlistId) {
    // Retrived from channels.list for uploads playlist.
    var channelsParams = {
      part: "contentDetails",
      forUsername: params.author,
      key: params.key
    }
    return channels(channelsParams, credentials, function (err, contentDetails) {
      if (err) {
        return cb(err);
      }

      params.playlistId = contentDetails.relatedPlaylists.uploads;
      return playlistItems(params, credentials, cb);
    });
  }
  
  var limit = params.maxResults || 0;

  if (!limit) {
    // No limit, caps at 50.
    params.maxResults = 50;
  }
  if (limit && limit > 50) {
    // User specified a limit that is greater than 50, also cap at 50.
    params.maxResults = 50;
  }
  
  params.url = BASE_V3_API + "/playlistItems";
  if (!params.part) {
    // Retrived from playlist.list for uploads playlist.
    params.part = "snippet";
  }
  
  if (credentials && credentials.access_token) {
    params.access_token = credentials.access_token;
  }

  spashttp.request(params, credentials, function (err, playlistResult) {
    if (err) {
      return cb(err, playlistResult);
    }
    
    if (playlistResult.error) {
      return cb(playlistResult.error, null);
    }
    
    var items = playlistResult.items.map(function (item) {
      // We need the video's ID, which is nested inside.
      item.snippet.id = item.snippet.resourceId.videoId;
      return item;
    });

    if (limit !== items.length && playlistResult.nextPageToken) {
      // API returns a token for next page, we use it to go to the next one.
      // Also, only when we haven't gotten the exact amount of items needed.
      params.pageToken = playlistResult.nextPageToken;
      var remainings = limit - items.length;
      // Remainings will be gt than 0, except when limit is 0, because
      // this clause only happens when there is next page, meaning either
      // limit was set to 0 or gt 50.
      params.maxResults = remainings > 0? remainings : 0;
      // Recursively call the next results page, appending to the items.
      playlistItems(params, credentials, function (err, nextPageItems) {
        if (err) {
          return cb(err);
        }
        
        Array.prototype.push.apply(items, nextPageItems);
        cb(err, items);
      });
    } else {
      // Base case, no more results, bail out.
      cb(err, items);
    }
  });
}

function playlistItemsWithTags(params, credentials, cb) {
  'use strict';
  function getVideoDetails(item, callback) {
    // Extra request per item to get the tags
    var videoParams = {
      url: BASE_V3_API + "/videos",
      id: item.snippet.id,
      part: params.part || "snippet",
      key: params.key
    };

    if (credentials && credentials.access_token) {
      videoParams.access_token = credentials.access_token;
    }

    spashttp.request(videoParams, credentials, function(err, result) {
      if (err) {
        return callback(err);
      }
      
      var data = result && result.items && result.items[0] && result.items[0].snippet;
      if (data) {
        item.snippet.tags = data.tags;
      } else {
        item.snippet.tags = [];
      }
      
      callback(err, item);
    });
  }

  playlistItems(params, credentials, function(err, items) {
    if (err) {
      return cb(err);
    }
    async.map(items, getVideoDetails, cb);
  });
}

exports.v3 = {
  channels: channels,
  playlistItems: playlistItems,
  playlistItemsWithTags: playlistItemsWithTags
};
