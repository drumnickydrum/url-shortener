const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Url = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});
Url.plugin(AutoIncrement, { inc_field: 'short_url' });

module.exports = mongoose.model('url', Url);
