const googleTranslate = require('google-translate-api');
const Promise = require('bluebird');
const fs = require('fs');

Promise.promisifyAll(fs);
Promise.promisifyAll(googleTranslate);

const from = 'en';
const to = 'hi';

const translate = async (text, from, to) => {
  const { text: translatedText } = await googleTranslate(text, { from, to });
  return translatedText;
};

const readFile = async filename => {
  const result = await fs.readFileAsync(filename, 'utf8');
  return JSON.parse(result);
};

const translateField = async data => {
  const translatedText = await Promise.map(data, async row => {
    const translated = await translate(row.title, from, to);
    row.title = translated;

    if (row.phrases) {
      const translatedText = await Promise.map(row.phrases, async p => {
        const translatedPhrase = await translate(p.phrase, from, to);
        p.phrase = translatedPhrase;
      });
    }
    return row;
  });
  console.log('translatedText', JSON.stringify(translatedText));
};

Promise.resolve()
  .then(() => readFile(process.argv[2]))
  .then(translateField)
  .catch(console.error);
