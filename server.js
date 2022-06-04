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




app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"/static/templates/homepage/index.html"));
});

app.get('/bored', (req, res) => {
  res.sendFile(path.join(__dirname,"/static/templates/bored/index.html"));
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
  console.log('App is online!');
  console.log('http://localhost:3000');
});
