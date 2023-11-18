var express = require('express');
var layouts = require('express-ejs-layouts');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { MongoClient } = require("mongodb");
const url = "mongodb+srv://forest:0626@cluster0.xkln9sw.mongodb.net";
const client = new MongoClient(url);

var app = express();

const store = new MongoDBStore({
  uri: url + '/radio',
  collection: 'sessions'
});

const Song = new Schema({
  title: { type: String, default: '' },
  artist: { type: String, default: '' },
  duration: { type: Number, min: 0.0 },
  genre: { type: String, default: '' }
});

const DJ = new Schema({
  name: { type: String, default: '' },
  listed: { type: Boolean },
  age: { type: Number, min: 1 },
  times: [{ type: String, default: '' }]
});

const Playlist = new Schema({
  djName: { type: String },
  timeslot: { type: String },
  songs: [{ type: String, default: '' }]
});

app.use(express.static('assets'));
app.use(layouts);

app.set('view engine', 'ejs');
app.set('layout', 'layouts/default');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secretCode',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
  store: store
}));

async function main() {
  await mongoose.connect('mongodb+srv://forest:0626@cluster0.xkln9sw.mongodb.net/radio');
  const SongModel = mongoose.model('songs', Song);
  const DJModel = mongoose.model('djs', DJ);
  const PlaylistModel = mongoose.model('playlists', Playlist);

  // get song list and dj list
  djsObjs = await DJModel.find({});
  
  songsObjs = await SongModel.find({});
  
  // get song playing
  let song = "";
  await client.connect();
  const db = client.db("radio");
  const songs = db.collection("songs");
  const songDoc = await songs.findOne();
    songObj = await SongModel.findOne({});
  song = songObj.title;
  client.close();

  var session;

  // routes
  app.get(['/'], async (req, res) => {
    res.render('pages/logonpage', {
      role: "Unknown User",
      currentSong: song
    });
  });

  app.post(['/login'], async (req, res) => {
    session = req.session;
    if(req.body.user) {
      session.user = req.body.user
      res.redirect('/dj');
    } else {
      res.redirect('/');
    }
  });
  app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
      res.redirect('/') // will always fire after session is destroyed
    })
  });

  app.get(['/dj'], async (req, res) => {
    session = req.session;
    if(session.user) {
      songObjs = await SongModel.find()

      res.render('pages/dj', {
        role: "DJ",
        currentSong: song,
        songList: songsObjs,
        djsList: djsObjs
      });
    } else {
      res.redirect('/');
    }
  });

  app.get('/producer', function (req, res) {
    res.render('pages/producer', {
      role: "Producer",
      currentSong: song
    });
  });

  app.get('/listener', function (req, res) {
    res.render('pages/listener', {
      role: "Listener",
      currentSong: song
    });
  });

  app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
      res.redirect('/');
    })
  });

  app.post(['/playlistupdate'], async (req, res) => {
    session = req.session;

    //console.log(req.body)

    if(session.user) {
      songObjs = await SongModel.find()

      res.render('pages/dj', {
        role: "DJ",
        currentSong: song,
        songList: songsObjs,
        djsList: djsObjs
      });
    } else {
      res.redirect('/');
    }
  });


  app.listen(8080);
}

main();