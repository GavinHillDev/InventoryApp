var mongoose = require('mongoose')

var Schema = mongoose.Schema

var GenreSchema = new Schema (
    {
        name: {type: String, required: true, maxLength: 100, minLength: 3},

    }
)
GenreSchema
.virtual('url')
.get(function () {
    return '/inventory/genre/' + this._id;
  });

module.exports = mongoose.model('Genre', GenreSchema);
