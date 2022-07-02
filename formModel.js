const mongoose = require("mongoose");
const schema = mongoose.Schema;

const formModel = new schema({
    name : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true 
    },
    password : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : false
    }
})

const formSchema = mongoose.model("userAuth",formModel);

module.exports = {formSchema};