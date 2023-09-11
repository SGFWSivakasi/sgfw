var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
   userName:{type: String, required:true},
   password:{type: String, required:true}
});

module.exports = mongoose.model('Login', schema);