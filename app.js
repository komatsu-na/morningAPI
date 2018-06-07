const express = require('express');
const request = require('sync-request');
const app = express();
var util = require('util');

const port = 3000;

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
}

function callForecastAPI() {
  var res = request('GET', 'http://weather.livedoor.com/forecast/webservice/json/v1?city=130010');
  var json = JSON.parse(res.getBody('utf8'));
  var telop = json.forecasts[0].telop;
  var tempMax;
  var tempMin;
  console.log(json.forecasts[1].temperature);
  console.log(json.forecasts[0].temperature);
  if (json.forecasts[0].temperature.max != null) {
    tempMax = json.forecasts[0].temperature.max.celsius + "dodesu.";
  } else {
    tempMax = "wakarimasenn.";
  }
  if (json.forecasts[0].temperature.min != null) {
    tempMin = json.forecasts[0].temperature.min.celsius + "dodesu.";
  } else {
    tempMin = "wakarimasenn.";
  }
  var result = new Array(3);
  result[0] = callKanaAPI(telop);
  result[1] = tempMax;
  result[2] = tempMin;
  console.log(result);
  return result;
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
}

function callRomeAPI(sentence) {
  var url = 'https://green.adam.ne.jp/roomazi/cgi-bin/api.cgi?yomi=' + encodeURIComponent(sentence) + '&cmd=N&callback=mycallback'
  var res = request('GET', url);
  var callback = res.getBody('utf8');
  return eval(callback);
}

function mycallback(json) {
  return json.roomazi;
}

app.get('/', (req, res) => {
  var fortune = callFortuneAPI().replace(/。\s+/g, ".").replace(/\s+/g, "’").replace(/、’/g, " ");
  var weather = callForecastAPI();
  var result = {
    'fortune': fortune,
    'weather': weather[0],
    'tempMax': weather[1],
    'tempMin': weather[2]
  }
  console.log(result);
  res.send(result);
});

app.listen(port, () => {
  console.log('listen: ' + port);
});