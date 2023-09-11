var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type:String, required:true},
    rate:{type:String,required:true},
    per:{type:String,required:true},
    type:{type:String,required:true},
    currentStock:{type:Number, default:0}
});

module.exports = mongoose.model('Product', schema);