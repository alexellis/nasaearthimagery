## NASA Earth Imagery
==============================

* Find a fly-by from the (assets) Landsat 8 satellite
* Download a thumbnail from the (imagery) endpoint

### Installation

With Node 4.x or greater:

```
git clone http://github.com/alexellis/nasaearthimagery
npm install
```

### Running the code:

```
node app.js
```

Alter app.js for the specific latitude and longitude:

```

// Plane grave-yard
var lat=32.1499889;
var lon=-110.8358417;

var when = moment("2015-01-01").toDate();
var cloudScore = true;
var filePrefix = "plane_graveyard_";
```

### Deprecated feature

Nasa's assets endpoint used to allow a 'dim' parameter to be passed in specifying the zoom level on the resuling thumbnails. Unfortunately this appears to have been broken for over a year already and I doubt they will fix it.

```
{"message": "Admins have been notified.", "error": "unsupported operand type(s) for /: 'unicode' and 'int'"}
```
