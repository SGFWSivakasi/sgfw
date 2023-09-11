var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
    date:{type:Date,default: +new Date()},
    partyName: {type:String, required:true},
    partyAddress: {type:String, required:true},
    partyMob: {type:String, required:true},
    partyEmail: {type:String, required:true},
    billItems:{type:Object, required:true},
    netTotal:{type:String,required:true},
    discValue:{type:String,required:true},
    discAmt:{type:String,required:true},
    subTotal:{type:String,required:true},
    sgst:{type:String,required:true},
    cgst:{type:String,required:true},
    overallTotal:{type:String,required:true},
    amountInWords:{type:String,required:true}
});



module.exports = mongoose.model('Bill', schema);

