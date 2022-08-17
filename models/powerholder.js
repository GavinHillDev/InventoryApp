var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PowerholderSchema = new Schema(
  {
    charactername: {type: String, required: true, maxLength: 100},
    anime: {type: String, required: true}
  }
);


// Virtual for author's URL
PowerholderSchema
.virtual('url')
.get(function () {
  return '/inventory/powerholder/' + this._id;
});

//Export model
module.exports = mongoose.model('Powerholder', PowerholderSchema);