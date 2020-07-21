var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const rq = require('request-promise');

var client_id = 'b311e559cbf044f8a774e51ba66adfc4'; 
var client_secret = '9b340aec80664664aa40e2611fce64f0'; 
var redirect_uri = 'http://localhost:8888/callback';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';
var app = express();


app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

   app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
  
    // your application requests authorization
    var scope = 'playlist-modify-public user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
      }));
  });

  app.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter
  
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
  
    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
    } else {
      res.clearCookie(stateKey);
      var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirect_uri,
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
      };
  
      request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
  
          var access_token = body.access_token,
              refresh_token = body.refresh_token;
  
          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          };
  
          // use the access token to access the Spotify Web API
          request.get(options, function(error, response, body) {
            console.log(body);
          });
  
          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
        }
      });
    }
  });





/*
    Frontend- searchs for playlist/moode 
    Backend- take those and searches for playlists
    -
    - 
*/

/*
    Pass the header into the smaller functions 
    Functions make the api calls. 
*/
var createPlaylist = function(){

}

app.get('/search', async function(req,res) {
    var access_token  = req.query.access_token
    var search_input = req.query.search_input
    // console.log(search_input)
    var tracks = await apiOffset(access_token,search_input)
    // console.log(tracks.length)
    var trackInfo = await getTrackInfo(access_token, tracks)
    //For each track info that we filtered. Create a playlist, and then add it. 
    //Each track will URI. Create the playlist, loops through trackInfoList 
    //URI List call: https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
    //Create method here to take in trackInfo 
    console.log(trackInfo.length)
    var playlist = await callAddSongsToPlaylist(access_token, trackInfo)

    //Ask a user for the name of the playlist. Create the play list, search the songs, add it in. 
    res.send("YES");
});

const createPlayList = async (access_token) =>{
  var options = {
    method: 'POST',
    url: 'https://api.spotify.com/v1/users/1295357638/playlists',
    headers: { 'Authorization': 'Bearer ' + access_token },
    body:{
        name:"Tousif Playlist GYMMM",
        public: true,
        collaborative:false,
        description:"Testing this app"
    },
    json: true
  };

  let payload = await rq(options)
  return payload
}

const addTrackPlaylist = async (access_token,playlistId,uris) =>{ 
  var url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
  console.log(url)
  var options = {
    method: 'POST',
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    body:{
      uris : uris
    },
    json: true
  };

  let payload = await rq(options)
  return payload
}

const populatePlaylist = async (access_token,playlistId,uris) =>{
  var songs = []
  //While songs is getting appended 
  //Uris has 500 songs 
  //Api takes 100 songs. 
  //[a, b, c, d, .......]

  var songCounter = 0
  for(var i = 0; i<uris.length; i ++){
    var item = uris[i]
    songs.push(item)
    songCounter = songCounter + 1
    if (songCounter == 100 || i == uris.length){
        await addTrackPlaylist(access_token, playlistId,songs)
        songs = []
        songCounter = 0 
    }
  }
  if(songs.length != 0){
    await addTrackPlaylist(access_token, playlistId,songs)
    songs = []
  }

}


const callAddSongsToPlaylist = async (access_token, tracks) => {
  let payload = await createPlayList(access_token)
  var playlistId = payload.id
  var trackUris = []
  for(var i =0; i < tracks.length; i++){
    var track = tracks[i]
    trackUris.push(track.uri)
  }
  let response = await populatePlaylist(access_token,payload.id,trackUris)
  console.log(response)
  return response
}

//refactor idea 
//Make this generic, pass the url throughout each time 
const callPlaylistApi = async (access_token, url) =>{
  var options = {
    url: url,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json:true
  }

  let payload = await rq(options)
  return payload
}

const getTracks = async (access_token,url) => {
    var options = {
      url: url,
      headers: { 'Authorization': 'Bearer ' + access_token },
      json:true
    }

    let payload = await rq(options)
    return payload
}

/*

*/


/*
 tracks: {
    href: 'https://api.spotify.com/v1/playlists/4XA7qJO7AnflZLUJE6Gmeu/tracks',
    total: 161
  },

Can get the track info as well 
*/
var playlistIds = []
var trackUrl =[]
var getPlayListIds = function(playlists){
  for (var i =0; i < playlists.length; i++){
      var data = playlists[i]
      playlistIds.push(data.id)
      trackUrl.push(data.tracks.href)
  }
}


//TODO: Filter the playlists somehow 
const getTrackInfo = async (access_token,trackUrls) => {
  var tracks = []
  
  for(var i =0; i < trackUrls.length; i++){
    var url = trackUrls[i]
    //console.log(url)
    var item = await getTracks(access_token,url)

    for(var j=0; j < item.items.length; j++){
      var track = item.items[j].track
      if(track !== null){
        if(track.popularity > 75){
          const found = tracks.some(el => el.name === track.name);
          if (!found) {
            tracks.push(track)
            
          }
        }
      }else{
        console.log(track)
      }
      
    }
  }

  console.log(tracks.length)
  return tracks
}

//Search through songs for one playlist. 
//returns a list of tracks
const trackPagination = async (access_token, url) => {
  var tracksResponse = await getTracks(access_token,url)
  trackList = tracksResponse.items 
  //For each track in tracklist
  //Apend the track to a list

  //Do the pagiation if thre is a next. 
  nextUrl = tracksResponse.next
  offset = tracksResponse.offset
  while(nextUrl != null){
    
  }
  //Loop logic, call apis with offset 

  //append to the list 
}

var apiOffset = async function(access_token, search_input){
  //Create the url here?! 
  var url = 'https://api.spotify.com/v1/search?' +
    querystring.stringify({
      q: search_input,
      type : 'playlist',
      limit: 50
    });

    apiResults = await callPlaylistApi(access_token, url)
    playlists = apiResults.playlists

    getPlayListIds(playlists.items)
    nextUrl = playlists.next
    offset = playlists.offset
    total = playlists.total
    console.log(nextUrl)
    console.log("old offset " + offset)

    //While next url is not null, to get all the values. 
    while(offset != 100){
      newResults = await callPlaylistApi(access_token, nextUrl)
      getPlayListIds(newResults.playlists.items)
      console.log(newResults.playlists.next)
      offset = newResults.playlists.offset
      nextUrl = newResults.playlists.next
      console.log(newResults.playlists.next)
      console.log("new offset "+ offset)
    }
  
    console.log("length of playlist "+ playlistIds.length)
  return trackUrl
}



/*
Refactor: 
Make a file with all the api calls for the spotify api. 
Layer over the API
*/


/*
  Create a Playlist
  Get name from and all other info from 
  A modal form
*/
app.get('/create_playlist', function(req,res) {
    var access_token  = req.query.access_token
    var options = {
        url: 'https://api.spotify.com/v1/users/1295357638/playlists',
        headers: { 'Authorization': 'Bearer ' + access_token },
        body:{
            name:"TESTINGAPI",
            public: true,
            collaborative:false,
            description:"TEST"
        },
        json: true
      };

      request.post(options, function(error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log(body);
            res.send({
                'DONE':'DONE'
            });
          }else{
              console.log(error)
              console.log(response.statusCode)
          }
      });
});

app.get('/refresh_token', function(req, res) {
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };
  
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });
  
  console.log('Listening on 8888');
  app.listen(8888);