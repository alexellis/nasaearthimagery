## NASA Earth Imagery

Download a tile/thumbnail from the LandSat 8 dataset. 

#### Installation / running

Create directory called 'images'
` mkdir -p images`

```
npm install

node app lat lon
```

#### How the program works

First find all passes by date of the satellite, then request a thumbnail from the API

Follow API through and download the images in batches of 5.

The queuing mechanism is used to off-set throttling on the data-API.

[Blog entry](http://quad.ae24.space/nasa-earth-imagery-api/)


#### Known issues

Nasa appear to have deprecated the use of the tileDimension parameter from the API. You may want to comment this out.


