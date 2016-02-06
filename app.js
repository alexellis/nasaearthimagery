var moment = require('moment');
var Landsat = require("./landsat");

// Plane grave-yard
var lat=32.1499889;
var lon=-110.8358417;

var when = moment("2015-01-01").toDate();
var cloudScore = true;
var filePrefix = "plane_graveyard_";
var landsat = new Landsat("images/", "DEMO_KEY");

landsat.findFlyby(lat,lon, when, cloudScore, function(err, flyby) {
	if(err) {
		return console.error(err);
	}
	console.log("Fly-bys: " + (flyby && !flyby.error ? "found" : "not found"));

	if(flyby && !flyby.error) {
		landsat.downloadThumbnail(flyby, filePrefix, function(err) {
			if(err) {
				return console.error(err);
			}

			console.log("Thumbnails downloaded.");
		});
	}
});
