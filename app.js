const express = require('express');
const request = require("request");
const app = express();
var util = require('util');

const port = 3000;
var result;

// 現在日時を取得する
var now = new Date();
var nowYear = now.getYear();
var nowMonths = now.getMonth() + 1;
var nowDate = now.getDate();
var date = 2018 + '/0' + 6 + '/0' + 1;

function fortuneAPI() {
  request.get({
    url: "http://api.jugemkey.jp/api/horoscope/free/2018/06/01",
    json:true
  }, function (err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log(body.horoscope[date][8].content);
      result = body.horoscope[date][8].content;
      }
  });
  }

app.get('/', (req, res) => {
  fortuneAPI();
  res.send(result);
});

app.listen(port, () => {
  console.log('listen: ' + port);
});