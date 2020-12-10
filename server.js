require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const Url = require('./model.js');

const { url } = require('inspector');
const { userInfo } = require('os');
// connect to mongoDB Atlas database
require('dotenv').config();
mongoose.connect(
  process.env.DB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (req, res) => {
    console.log('Connected to database');
  }
);

const app = express();
app.use(express.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const shrink = (url) => {
  const newUrl = new Url({
    original_url: url,
  });
  const response = newUrl.save().then((item) => item);
  return response;
};

app.post('/api/shorturl/new/', (req, res) => {
  const tempUrl = req.body.url;
  if (!tempUrl) return res.json({ error: 'invalid url' });
  const url = tempUrl.replace(/^https?:\/\/(.+)/, '$1');
  dns.lookup(url, async (err, a, b) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      const { original_url, short_url } = await shrink(url);
      return res.json({ original_url, short_url });
    }
  });
});

app.get('/api/shorturl/:short/', async (req, res) => {
  let newUrl = await Url.find({ short_url: req.params.short }).then((i) => {
    const rd = i[0].original_url;
    console.log(rd);
    return rd;
  });
  console.log(newUrl);
  if (newUrl.substr(0, 7) !== 'http://' || newUrl.substr(0, 8) !== 'https://') {
    newUrl = 'http://' + newUrl;
  }
  console.log(newUrl);
  return res.redirect(307, newUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
