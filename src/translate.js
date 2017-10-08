const googleTranslate = require('google-translate-api');
const Promise = require('bluebird');
const fs = require('fs');

Promise.promisifyAll(googleTranslate);
Promise.promisifyAll(fs);

const translator = (row, field) => {
  return googleTranslate(row[field], { from: 'en', to: 'hi' })
    .then(res => {
      row[field] = res.text;
      return row;
    })
    .catch(err => {
      console.error(err);
    });
};

const translate = text => {
  Promise.map(text, function(row) {
    return translator(row, 'title');
  })
    .then(function() {
      Promise.map(text, function(row) {
        if (row.phrases) {
          return Promise.map(row.phrases, function(data) {
            return translator(data, 'phrase');
          }).catch(err => {
            console.log(err);
          });
        }
      })
        .then(function() {
          console.log(JSON.stringify(text));
        })
        .catch(err => {
          console.log('main ', err);
        });
    })
    .catch(err => {
      console.log('main ', err);
    });
};

const readFile = filename => {
  fs
    .readFileAsync(filename, 'utf8')
    .then(data => {
      translate(JSON.parse(data));
    })
    .then();
};

readFile(process.argv[2]);

module.exports = {};
