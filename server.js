const express = require('express');
const path = require('path');
const request = require('request');
const body_parser = require('body-parser');
// const bcrypt = require('bcryptjs');
const session = require('express-session');
const crypto = require('crypto');
try{require("dotenv").config();}catch(e){console.log(e);}
// const { exec } = require("child_process");
const { networkInterfaces } = require('os');
const cors = require('cors');

const app = express(); // create an instance of an express app


//middleware
app.use(cors());
app.use(body_parser.json()); // support json encoded bodies
app.use(body_parser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: crypto.randomBytes(32).toString("hex"), 
  //24 hours
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

//static files
app.use(express.static(path.join(__dirname, '/static')));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"/static/templates/homepage/index.html"));
});

app.get('/bored', (req, res) => {
  res.sendFile(path.join(__dirname,"/static/templates/bored/index.html"));
});



app.get('/gtoken', (req, res) => {
  var url = 'https://www.googleapis.com/oauth2/v3/token';
  var formData = {
    code: req.query.code,
    client_id: process.env.G_CLIENT_ID,
    client_secret: process.env.G_CLIENT_SECRET,
    redirect_uri: host + "/googlecallback",
    grant_type: 'authorization_code'
  }
  request.post({url: url, form: formData}, (error, response, body) => {
    if (error){
      console.log(error);
      alert(error);
    }
    var info = JSON.parse(body);
    if(info.error != undefined){
      res.send(info.error);
    }
    else{
      req.session.google_token = info.access_token;
      res.redirect('/registration-google');
    }
  });
});

app.get('/registration-google', (req, res) => {
  if(req.session.google_token == undefined){
    res.send('Error');
  }
  var g_token = req.session.google_token;
  var data_url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+g_token;
  // var headers = {'Authorization': 'Bearer '+g_token};
  var utente;
  request.get({url: data_url}, (err, resp, body) => {
    if (err){
      console.log(err);
    }
    var data = JSON.parse(body);
    if(data.error != undefined){
      res.send(data.error);
    }
    else{
      utente = {
        "id":	data.id,
        "email":	data.email,
        "verified_email":	data.verified_email,
        "name":	data.name,
        "given_name":	data.given_name,
        "family_name":	data.family_name,
        "picture":	data.picture,
        "locale":	data.locale,
      }
    }
    req.session.regenerate(() => {
      req.session.user = {username: utente.email, email: utente.email};
      req.session.google_token = g_token;
      // va salvato l'utente o va effettuato il login con le credenziali google, dove l'username può essere la email e la password il token
      res.redirect("/");
    });
  });
});




app.get("/getBored", (req, res) => {
  var type = req.query.type;
  var participants = req.query.participants;
  var url = "http://www.boredapi.com/api/activity";
  if (type && participants)
    url += '?type=' + type + "&participants=" + participants;
  else if (type && !participants)
    url += '?type=' + type;
  else if (!type && participants)
    url += "?participants=" + participants;
  else
    url += "/";
  request.get({url: url}, (err, resp, body) => {
    if (err){
      console.log(err);
    }
    var data = JSON.parse(body);
    res.send(data);
  });
});




app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
  console.log('localhost:3000');
});
