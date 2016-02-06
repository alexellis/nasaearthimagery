var moment = require('moment');
var request = require('request');
var async = require('async');
var fs = require('fs');
var path = require('path');

function landsat(downloadFolder, key) {
	this.key = key;
	this.downloadFolder = downloadFolder;
}

var buildFlybyUrl = function(latitude, longitude, dateWhen, cloudScore, key) {
	var when = moment(dateWhen).format("Y-MM-DD");

	var url = "https://api.nasa.gov/planetary/earth/imagery?api_key="+key
			+"&lat="+latitude+"&lon="+longitude+"&date="+when+"&cloud_score=True";
	return url;
}

/**
 ** @dateWhen - should match the exact date of the flyby
 ** @cloudScore - include Nasa's scoring on cloud coverage
 **
 **/
landsat.prototype.findFlyby = function(latitude, longitude, dateWhen, cloudScore, cb) {
	var that = this;
	var url = buildFlybyUrl(latitude, longitude, dateWhen, cloudScore, that.key);
	request.get(url, function(err, res, body) {
		if(err) {
			return cb(err, null);
		}
		var flyby= JSON.parse(body);
		cb(null, flyby);
	});
}

landsat.prototype.downloadThumbnail = function(flyby, prefixFolder, done) {
	var that = this;
	request.head(flyby.url, function(err, res, body) {
		var r = request(flyby.url).
			pipe(fs.createWriteStream(path.join(that.downloadFolder, prefixFolder + flyby.id.replace('/', '_') + ".jpg")));
		r.on('close', done);
		r.on('error', done);
	});
}

module.exports = landsat;
