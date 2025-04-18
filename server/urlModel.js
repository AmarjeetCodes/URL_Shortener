const mongoose   = require("mongoose");

const  urlSchema = new mongoose.Schema({
    longURL : {
        type :String,
        required    : true
    },
    shortURL:{
        type:String,
        required:true,
        // unique:true
    },
    createdAt :{
        type : Date,
        default : Date.now
    }
});

module.exports = mongoose.model('URL' , urlSchema);