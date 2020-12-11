require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const Url = require('./model.js');

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

// create shortened url
const shrink = (url) => {
  const newUrl = new Url({
    original_url: url,
  });
  const response = newUrl.save().then((item) => item);
  return response;
};

app.post('/api/shorturl/new/', (req, res) => {
  const tempUrl = req.body.url;
  if (tempUrl.match(/^https?:\/\//)) {
    const urlObject = new URL(tempUrl);
    dns.lookup(urlObject.hostname, async (err, a, b) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // console.log(urlObject)
        const { original_url, short_url } = await shrink(urlObject.href);
        return res.json({ original_url: tempUrl, short_url });
      }
    });
  } else {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short/', async (req, res) => {
  let newUrl = await Url.find({ short_url: req.params.short }).then((i) => {
    const rd = i[0].original_url;
    return rd;
  });
  return res.redirect(307, newUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
