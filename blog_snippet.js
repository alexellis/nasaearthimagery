// * Download a tile/thumbnail from the LandSat 8 dataset.
// Create directory called 'images'
// npm install
// node app.js lat lon
// Known issue - Nasa seems to have deprecated the tileDimension variable form the API

// * How program works
// First find all passes by date of the satellite, then request a thumbnail from the API
// Follow API through and download the images in batches of 5.
// Timing is to off-set throttling on the data-API.


var request = require('request');
var fs = require('fs');
var path=require('path');
var async = require("async");

// The larger the number, the smaller the zoom level
var tileDimension = 0.145;

//tileDimension=0.125;
//tileDimension=0.025;	// default for API
//tileDimension=0.075;

// Sometimes the API returns error 500, so we try again and then it's OK.
var apiRetryCount = 5;
var max_queue_download_size = 5;

// Ceará
//var lat=-3.72168;
//var lon=-38.519932;

// Cathedral
// var lat=52.572484;
// var lon=-0.23921;

// Chalk man
//var lat=50.8135003;
//var lon=-2.4754754;

// TM
//var lat=31.778116;
//var lon=35.235993;

// Rain forest
//var lat=-10.141932;
//var lon=-75.27832;

// Chernobyl reactor
//var lat=51.389636;
//var lon=30.099033;

// Plane grave-yard
//var lat=32.1499889;
//var lon=-110.8358417;

// Solar installation in desert.
var lat = 44.525049;
var lon= -110.83819;

if(process.argv.length==4) {
	var parts = process.argv.slice(2);
	lat = parts[0].replace(',','').trim();
	lon = parts[1].replace(',','').trim();
}

var key="DEMO_KEY";

try {
	key = fs.readFileSync('nasa_key','utf8').split('\n')[0];
	console.log("NASA key: (\"" + key+"\")");
} catch (e){
	console.log("No nasa_key defined, opting to use public api_key");
}

// cap images to save API key usage.
var cap = 10;

var begin = "2010-01-01";


var findFlybys= function(lat,lon,begin, callback) {
	var flyUrl = "https://api.nasa.gov/planetary/earth/assets?lon="+lon+"&lat="+lat+"&begin="+begin+"&api_key="+key;
	request(flyUrl, function (error, response, body) {
				var remaining = response.caseless.dict['x-ratelimit-remaining'];
				var limit = response.caseless.dict['x-ratelimit-limit'];
				console.log(flyUrl+ ", " + response.statusCode);
				console.log("API request limit - (" + remaining + "/" + limit+") - "  + ((remaining/limit)*100).toFixed(2) + "% available" );

				if (!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					callback(json);
				}
				else {
					console.log("Server error getting flybys.");
				}
	});
}

var requestApiAndImages = function(urls){
	var download = function(uri, filename, callback){
	  request.head(uri, function(err, res, body){
	    var r = request(uri).pipe(fs.createWriteStream(path.join("images", filename)));
	    r.on('close', callback);
	  });
	};

	console.log("API request URLs: " + urls.length);

	var requestAndReturn = function (imageUrls,apiUrl, callback, retries) {
		request(apiUrl, function (error, response, body) {

			if (!error && response.statusCode == 200) {
				var json = JSON.parse(body);
				var imageUrl=json["url"];
				imageUrls.push(imageUrl);
				console.log("Response: " + apiUrl+ ", " + response.statusCode + " " + retries+"/"+apiRetryCount +" [got " + imageUrls.length + " / " + urls.length+"]");
				callback();
				return;
			}

			console.log("Bad response: " + apiUrl+ ", " + response.statusCode + " " + retries+"/"+apiRetryCount +" [got " + imageUrls.length + " / " + urls.length+"]");
			if(error) {
				console.log("Error" + error);
			}
			if(response.statusCode==429) {
				console.log("NASA says no, error code 429, out of API usage limits.");
				callback();
			}
			else if(response.statusCode==500) {
				console.log("Unknown server error, trying again.");
				if(retries>apiRetryCount){
					console.log("Retried, but giving up now.");
					callback();
				}
				else {
					var timeSalt = Math.floor((Math.random() * 1300) + 300);
					setTimeout(function(){ requestAndReturn(imageUrls, apiUrl, callback,retries+1)},1+timeSalt);
				}
			}
		});
	}

	var downloadEachImage = function(urls) {
		var imageUrls=[];
		async.each(urls,
			function(apiUrl,callback) {
					requestAndReturn(imageUrls, apiUrl, callback, 0);
			}
			,function(err) {
				console.log("Queuing "+imageUrls.length+" thumbnails for download in batches of: " +max_queue_download_size+".");

				var queue = async.queue(function(task, callback) {
					var imageUrl= task.imageUrl;
					var startString="thumbid=";
					var start=imageUrl.indexOf("thumbid=")+startString.length;
					var end = imageUrl.indexOf("&");
					var fileName=imageUrl.substring(start, end).trim() + ".jpg";
					console.log(fileName + " requested.");
					download(imageUrl, fileName, function() {
						console.log(fileName +" downloaded.");
						callback();
					});
				}, max_queue_download_size);

				imageUrls.forEach(function(imageUrl) {
					queue.push( { imageUrl :  imageUrl }, function(err) {
						if(err){
							console.log("Error in queue: "+err);
						}
					} );
				});
			});
	};

	downloadEachImage(urls);
};

findFlybys(lat, lon, begin, function(flybyJson) {
	var flybys=flybyJson;
	var urls=[];
	flybys["results"].forEach(function(r){
		var url = "https://api.nasa.gov/planetary/earth/imagery?api_key="+key
			+"&lat="+lat+"&lon="+lon+"&date="+r["date"].substring(0,10)+"&cloud_score=True";
//"&dim="+tileDimension
			if(urls.indexOf(url)==-1){
				if(urls.length<=cap) {
					urls.push(url);
				}
			}
	});
	requestApiAndImages(urls);
});
