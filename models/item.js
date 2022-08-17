var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var ItemSchema = new Schema(
    {
        power : {type: String, required: true},
        desc : {type: String, required: true},
        price : {type: String, required: true},
        powerholder: {type: Schema.Types.ObjectId, ref: 'Powerholder', required: true},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}],
        // ammount : {type: Number, required: true}
    }
)

ItemSchema
.virtual('url')
.get(function () {
    return '/inventory/item/' + this._id;
  });

  module.exports = mongoose.model('Item', ItemSchema);