const express = require('express');
//const request = require("request");
const request = require('sync-request');
const app = express();
var util = require('util');

const port = 3000;
var fortune;
var weather;

// 現在日時を取得する
var now = new Date();
var nowYear = now.getFullYear();
var nowMonths = ('0' + (now.getMonth() + 1)).slice(-2);
var nowDay = ('0' + now.getDate()).slice(-2);
var date = nowYear + '/' + nowMonths + '/' + nowDay;

function callFortuneAPI() {
  var res = request('GET', "http://api.jugemkey.jp/api/horoscope/free/" + date);
  var json = JSON.parse(res.getBody('utf8'));
  var content = json.horoscope[date][8].content;
  return callKanaAPI(content);
  // request({
  //   url: "http://api.jugemkey.jp/api/horoscope/free/" + date,
  //   method: 'GET',
  //   json:true
  // }, function (err, res, body) {
  //   if(!err && res.statusCode == 200) {
  //     var content = body.horoscope[date][8].content;
  //     callKanaAPI(content);
  //   }
  // });
}

function callForecastAPI() {
  var res = request('GET', 'http://weather.livedoor.com/forecast/webservice/json/v1?city=130010');
  var json = JSON.parse(res.getBody('utf8'));
  var telop = json.forecasts[0].telop;
  return callKanaAPI(telop);

  // request({
  //   url: 'http://weather.livedoor.com/forecast/webservice/json/v1?city=130010',
  //   method: 'GET',
  //   json: true
  // }, function(err, res, body) {
  //   callKanaAPI(body.forecasts[0].telop)
  //   console.log(body.forecasts[1].telop);
  // })
}

function callKanaAPI(sentence) {
  var res = request('POST', 'https://labs.goo.ne.jp/api/hiragana', {
    headers: {
      'Content-Type': `application/x-www-form-urlencoded`,
      'Content-Type':'application/json'
    },
    json: {
      app_id:'',
      sentence:sentence,
      output_type:'katakana'
    }
  });
  var json = JSON.parse(res.getBody('utf8'));
  var kana = json.converted;
  return callRomeAPI(kana);
  // request({
  //   url: 'https://labs.goo.ne.jp/api/hiragana',
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': `application/x-www-form-urlencoded`,
  //     'Content-Type':'application/json'
  //   },
  //   json:true,
  //   form: {
  //     app_id:'',
  //     sentence:sentence,
  //     output_type:'katakana'
  //   }
  // }, function(err, res, body) {
  //   if(!err && res.statusCode == 200) {
  //     //console.log(body.converted);
  //     callRomeAPI(body.converted);
  //   }
  // });
}

function callRomeAPI(sentence) {
  var url = 'https://green.adam.ne.jp/roomazi/cgi-bin/api.cgi?yomi=' + encodeURIComponent(sentence) + '&cmd=N&callback=mycallback'
  var res = request('GET', url);
  var callback = res.getBody('utf8');
  return eval(callback);

  // var url = 'https://green.adam.ne.jp/roomazi/cgi-bin/api.cgi?yomi=' + encodeURIComponent(sentence) + '&cmd=N&callback=mycallback'
  // request({
  //   url: url,
  //   type: 'GET',
  // }, function(err, res, body){
  //   eval(body);
  // });
}

function mycallback(json) {
  return json.roomazi;
}

app.get('/', (req, res) => {
  fortune = callFortuneAPI();
  weather = callForecastAPI();
  var result = {
    'fortune': fortune,
    'weather': weather
  }
  console.log(result);
  res.send(result);
});

app.listen(port, () => {
  console.log('listen: ' + port);
});