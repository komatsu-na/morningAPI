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

function callFortuneAPI() {
  request({
    url: "http://api.jugemkey.jp/api/horoscope/free/2018/06/01",
    method: 'GET',
    json:true
  }, function (err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log(body.horoscope[date][8].content);
      result = body.horoscope[date][8].content;
      callKanaAPI(result);
    }
  });
}

function callKanaAPI(sentence) {
  request({
    url: 'https://labs.goo.ne.jp/api/hiragana',
    method: 'POST',
    headers: {
      'Content-Type': `application/x-www-form-urlencoded`,
      'Content-Type':'application/json'
    },
    json:true,
    form: {
      app_id:'',
      sentence:sentence,
      output_type:'katakana'
    }
  }, function(err, res, body) {
    if(!err && res.statusCode == 200) {
      console.log(body.converted);
      callRomeAPI(body.converted);
    }
  });
}

function callRomeAPI(sentence) {
  var url = 'https://green.adam.ne.jp/roomazi/cgi-bin/api.cgi?yomi=' + encodeURIComponent(sentence) + '&cmd=N&callback=mycallback'
  console.log(url);
  request({
    url: url,
    type: 'GET',
  }, function(err, res, body){
    eval(body);
  });
}

function mycallback(json) {
  console.log("aaaa");
  console.log(json.roomazi);
  result = json.roomazi;
}

app.get('/', (req, res) => {
  callFortuneAPI();
  res.send(result);
});

app.listen(port, () => {
  console.log('listen: ' + port);
});